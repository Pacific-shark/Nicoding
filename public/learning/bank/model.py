"""Nicoding: an inspectable logistic regression experiment on UCI Bank Marketing.

Python >=3.10, NumPy >=2.0. No pandas, sklearn or network access is needed.
The exact same implementation runs in the browser worker and this CLI.
This is a teaching implementation, not a calibrated marketing policy.
"""
import csv
import hashlib
import io
import json
import time
import numpy as np

NUMERIC = ['age', 'balance', 'previous']
CATEGORICAL = ['job', 'marital', 'education', 'housing', 'loan', 'poutcome']
ALLOWED = NUMERIC + CATEGORICAL
PROTOCOL = 'bank-v1-feature-groups-sha256-70-15-15'

def load_rows(text):
    rows = list(csv.DictReader(io.StringIO(text), delimiter=';'))
    if not rows or any(k not in rows[0] for k in ALLOWED + ['y']):
        raise ValueError('CSV does not contain the required bank.csv columns')
    for i, row in enumerate(rows):
        row['_id'] = i + 1
        if row['y'] not in ('yes', 'no'):
            raise ValueError('Label must be yes or no')
    return rows

def group_key(row):
    # Deliberately exclude label and post-contact fields from the split key.
    return json.dumps([row[k] for k in ALLOWED], ensure_ascii=True, separators=(',', ':'))

def split_rows(rows):
    splits = {'train': [], 'valid': [], 'test': []}
    for row in rows:
        bucket = int(hashlib.sha256(('nicoding-bank-42:' + group_key(row)).encode()).hexdigest()[:8], 16) % 100
        splits['train' if bucket < 70 else 'valid' if bucket < 85 else 'test'].append(row)
    if any(not value for value in splits.values()):
        raise ValueError('One split is empty')
    return splits

def labels(rows):
    return np.array([int(row['y'] == 'yes') for row in rows], dtype=np.float64)

def fit_preprocessor(rows, categorical=True):
    x = np.array([[float(row[k]) for k in NUMERIC] for row in rows])
    mean, scale = x.mean(axis=0), x.std(axis=0)
    scale[scale == 0] = 1.0
    categories = {k: sorted({row[k] for row in rows}) for k in CATEGORICAL} if categorical else {}
    return {'mean': mean.tolist(), 'scale': scale.tolist(), 'categories': categories,
            'features': NUMERIC + [k + '=' + v for k, values in categories.items() for v in values]}

def transform(rows, prep):
    numeric = np.array([[float(row[k]) for k in NUMERIC] for row in rows])
    parts = [(numeric - np.array(prep['mean'])) / np.array(prep['scale'])]
    for k, values in prep['categories'].items():
        parts.append(np.array([[float(row[k] == v) for v in values] for row in rows]))
    # Unknown categories become all-zero vectors; no fitting on validation/test.
    return np.concatenate(parts, axis=1)

def sigmoid(z):
    z = np.asarray(z)
    return np.exp(-np.logaddexp(0, -z))

def objective(x, y, w, b, l2=0):
    z = x @ w + b
    return float(np.mean(np.logaddexp(0, z) - y * z) + l2 * np.dot(w, w) / 2)

def gradients(x, y, w, b, l2=0):
    error = sigmoid(x @ w + b) - y
    return x.T @ error / len(y) + l2 * w, float(error.mean())

def metrics(y, scores, threshold=.5, fp_cost=1, fn_cost=5):
    y, p = np.asarray(y), np.asarray(scores)
    pred = p >= threshold
    tp = int(((y == 1) & pred).sum())
    fp = int(((y == 0) & pred).sum())
    fn = int(((y == 1) & ~pred).sum())
    tn = int(((y == 0) & ~pred).sum())
    safe = np.clip(p, 1e-12, 1 - 1e-12)
    return dict(n=len(y), tp=tp, fp=fp, fn=fn, tn=tn,
                precision=tp / (tp + fp) if tp + fp else None,
                recall=tp / (tp + fn) if tp + fn else None,
                accuracy=float((pred == y).mean()),
                logloss=float(-(y * np.log(safe) + (1 - y) * np.log1p(-safe)).mean()),
                selected=tp + fp, cost=fp * fp_cost + fn * fn_cost)

def predictions(rows, scores):
    return [dict(id=row['_id'], y=int(row['y'] == 'yes'), p=float(p),
                 age=int(row['age']), balance=int(row['balance']), previous=int(row['previous']))
            for row, p in zip(rows, scores)]

def train(rows, config, progress=None):
    started = time.perf_counter()
    lr, l2, epochs = float(config.get('lr', .3)), float(config.get('l2', .01)), int(config.get('epochs', 150))
    if not (.01 <= lr <= 1 and 0 <= l2 <= 1 and 10 <= epochs <= 400):
        raise ValueError('Parameters are outside the course experiment bounds')
    config = dict(lr=lr, l2=l2, epochs=epochs, categorical=bool(config.get('categorical', True)))
    splits = split_rows(rows)
    prep = fit_preprocessor(splits['train'], config['categorical'])
    x, y = transform(splits['train'], prep), labels(splits['train'])
    vx, vy = transform(splits['valid'], prep), labels(splits['valid'])
    w, b = np.zeros(x.shape[1]), 0.0
    history = []
    for epoch in range(epochs + 1):
        if epoch % 10 == 0 or epoch == epochs:
            # Display predictive loss without the regularizer for both splits.
            entry = dict(epoch=epoch, train=objective(x, y, w, b), valid=objective(vx, vy, w, b))
            history.append(entry)
            if progress:
                progress(json.dumps(entry))
        if epoch < epochs:
            gw, gb = gradients(x, y, w, b, l2)
            w -= lr * gw
            b -= lr * gb
    rate = float(y.mean())
    scores = sigmoid(vx @ w + b)
    return dict(version=1, protocol=PROTOCOL, config=config, counts={k: len(v) for k, v in splits.items()},
                prep=prep, weights=w.tolist(), bias=b, history=history, trainRate=rate,
                baseline=metrics(vy, np.full(len(vy), rate)), validation=metrics(vy, scores),
                predictions=predictions(splits['valid'], scores), seconds=time.perf_counter() - started)

def test_run(rows, run, threshold=.5, fp_cost=1, fn_cost=5):
    if run.get('protocol') != PROTOCOL:
        raise ValueError('Experiment belongs to a different dataset protocol')
    test = split_rows(rows)['test']
    scores = sigmoid(transform(test, run['prep']) @ np.array(run['weights']) + run['bias'])
    return dict(metrics=metrics(labels(test), scores, threshold, fp_cost, fn_cost),
                predictions=predictions(test, scores), threshold=threshold, fpCost=fp_cost, fnCost=fn_cost)

def main():
    from pathlib import Path
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--csv', default=str(Path(__file__).with_name('bank.csv')))
    parser.add_argument('--epochs', type=int, default=150)
    parser.add_argument('--lr', type=float, default=.3)
    parser.add_argument('--l2', type=float, default=.01)
    parser.add_argument('--numeric-only', action='store_true')
    parser.add_argument('--evaluate', help='Frozen report JSON exported by Nicoding, containing run and policy')
    parser.add_argument('--output', default='experiment.json')
    args = parser.parse_args()
    text = Path(args.csv).read_text(encoding='utf-8')
    rows = load_rows(text)
    if args.evaluate:
        frozen = json.loads(Path(args.evaluate).read_text(encoding='utf-8'))
        if frozen['datasetSha256'] != hashlib.sha256(Path(args.csv).read_bytes()).hexdigest():
            raise ValueError('CSV checksum differs from the exported experiment')
        policy = frozen['policy']
        result = test_run(rows, frozen['run'], policy['threshold'], policy['fpCost'], policy['fnCost'])
    else:
        result = train(rows, dict(epochs=args.epochs, lr=args.lr, l2=args.l2, categorical=not args.numeric_only))
    Path(args.output).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(result.get('metrics', result.get('validation')), ensure_ascii=False))
    print('Saved:', args.output)

if __name__ == '__main__':
    main()
