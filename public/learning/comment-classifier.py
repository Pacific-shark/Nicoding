"""Nicoding: a small PyTorch comparison for the browser comment classifier.

Install PyTorch following https://pytorch.org/get-started/locally/ for your platform.
Run: python comment-classifier.py --lr 0.3 --epochs 100
Replay a browser export: python comment-classifier.py --model nicoding-comment-classifier.json
Inspect the included data without PyTorch: python comment-classifier.py --describe

Synthetic examples share vocabulary across splits; this is a mechanism experiment,
not evidence of production quality. No test examples participate in fitting or selection.
The browser uses a different random initializer; training results need not match.
"""
import argparse
import copy
import json
from pathlib import Path

DATA = json.loads(r'''{"reviews":[{"text":"第一次购买：质量不错","label":1,"split":"train"},{"text":"第一次购买：使用很满意","label":1,"split":"train"},{"text":"第一次购买：这个很好用","label":1,"split":"train"},{"text":"第一次购买：包装完整","label":1,"split":"train"},{"text":"第一次购买：我很喜欢","label":1,"split":"train"},{"text":"第一次购买：价格便宜，质量不错","label":1,"split":"train"},{"text":"第一次购买：客服不错","label":1,"split":"train"},{"text":"第一次购买：物流不错","label":1,"split":"train"},{"text":"第一次购买：质量很差","label":0,"split":"train"},{"text":"第一次购买：使用很失望","label":0,"split":"train"},{"text":"第一次购买：这个不好用","label":0,"split":"train"},{"text":"第一次购买：包装破损","label":0,"split":"train"},{"text":"第一次购买：需要退货","label":0,"split":"train"},{"text":"第一次购买：价格便宜，效果很差","label":0,"split":"train"},{"text":"第一次购买：客服不好","label":0,"split":"train"},{"text":"第一次购买：物流很慢","label":0,"split":"train"},{"text":"这次收到：质量不错","label":1,"split":"train"},{"text":"这次收到：使用很满意","label":1,"split":"train"},{"text":"这次收到：这个很好用","label":1,"split":"train"},{"text":"这次收到：包装完整","label":1,"split":"train"},{"text":"这次收到：我很喜欢","label":1,"split":"train"},{"text":"这次收到：价格便宜，质量不错","label":1,"split":"train"},{"text":"这次收到：客服不错","label":1,"split":"train"},{"text":"这次收到：物流不错","label":1,"split":"train"},{"text":"这次收到：质量很差","label":0,"split":"train"},{"text":"这次收到：使用很失望","label":0,"split":"train"},{"text":"这次收到：这个不好用","label":0,"split":"train"},{"text":"这次收到：包装破损","label":0,"split":"train"},{"text":"这次收到：需要退货","label":0,"split":"train"},{"text":"这次收到：价格便宜，效果很差","label":0,"split":"train"},{"text":"这次收到：客服不好","label":0,"split":"train"},{"text":"这次收到：物流很慢","label":0,"split":"train"},{"text":"用了三天：质量不错","label":1,"split":"train"},{"text":"用了三天：使用很满意","label":1,"split":"train"},{"text":"用了三天：这个很好用","label":1,"split":"train"},{"text":"用了三天：包装完整","label":1,"split":"train"},{"text":"用了三天：我很喜欢","label":1,"split":"train"},{"text":"用了三天：价格便宜，质量不错","label":1,"split":"train"},{"text":"用了三天：客服不错","label":1,"split":"train"},{"text":"用了三天：物流不错","label":1,"split":"train"},{"text":"用了三天：质量很差","label":0,"split":"train"},{"text":"用了三天：使用很失望","label":0,"split":"train"},{"text":"用了三天：这个不好用","label":0,"split":"train"},{"text":"用了三天：包装破损","label":0,"split":"train"},{"text":"用了三天：需要退货","label":0,"split":"train"},{"text":"用了三天：价格便宜，效果很差","label":0,"split":"train"},{"text":"用了三天：客服不好","label":0,"split":"train"},{"text":"用了三天：物流很慢","label":0,"split":"train"},{"text":"用了一个月：质量不错","label":1,"split":"valid"},{"text":"用了一个月：使用很满意","label":1,"split":"valid"},{"text":"用了一个月：这个很好用","label":1,"split":"valid"},{"text":"用了一个月：包装完整","label":1,"split":"valid"},{"text":"用了一个月：我很喜欢","label":1,"split":"valid"},{"text":"用了一个月：价格便宜，质量不错","label":1,"split":"valid"},{"text":"用了一个月：客服不错","label":1,"split":"valid"},{"text":"用了一个月：物流不错","label":1,"split":"valid"},{"text":"用了一个月：质量很差","label":0,"split":"valid"},{"text":"用了一个月：使用很失望","label":0,"split":"valid"},{"text":"用了一个月：这个不好用","label":0,"split":"valid"},{"text":"用了一个月：包装破损","label":0,"split":"valid"},{"text":"用了一个月：需要退货","label":0,"split":"valid"},{"text":"用了一个月：价格便宜，效果很差","label":0,"split":"valid"},{"text":"用了一个月：客服不好","label":0,"split":"valid"},{"text":"用了一个月：物流很慢","label":0,"split":"valid"},{"text":"朋友收到：质量不错","label":1,"split":"test"},{"text":"朋友收到：使用很满意","label":1,"split":"test"},{"text":"朋友收到：这个很好用","label":1,"split":"test"},{"text":"朋友收到：包装完整","label":1,"split":"test"},{"text":"朋友收到：我很喜欢","label":1,"split":"test"},{"text":"朋友收到：价格便宜，质量不错","label":1,"split":"test"},{"text":"朋友收到：客服不错","label":1,"split":"test"},{"text":"朋友收到：物流不错","label":1,"split":"test"},{"text":"朋友收到：质量很差","label":0,"split":"test"},{"text":"朋友收到：使用很失望","label":0,"split":"test"},{"text":"朋友收到：这个不好用","label":0,"split":"test"},{"text":"朋友收到：包装破损","label":0,"split":"test"},{"text":"朋友收到：需要退货","label":0,"split":"test"},{"text":"朋友收到：价格便宜，效果很差","label":0,"split":"test"},{"text":"朋友收到：客服不好","label":0,"split":"test"},{"text":"朋友收到：物流很慢","label":0,"split":"test"},{"text":"再次购买：质量不错","label":1,"split":"test"},{"text":"再次购买：使用很满意","label":1,"split":"test"},{"text":"再次购买：这个很好用","label":1,"split":"test"},{"text":"再次购买：包装完整","label":1,"split":"test"},{"text":"再次购买：我很喜欢","label":1,"split":"test"},{"text":"再次购买：价格便宜，质量不错","label":1,"split":"test"},{"text":"再次购买：客服不错","label":1,"split":"test"},{"text":"再次购买：物流不错","label":1,"split":"test"},{"text":"再次购买：质量很差","label":0,"split":"test"},{"text":"再次购买：使用很失望","label":0,"split":"test"},{"text":"再次购买：这个不好用","label":0,"split":"test"},{"text":"再次购买：包装破损","label":0,"split":"test"},{"text":"再次购买：需要退货","label":0,"split":"test"},{"text":"再次购买：价格便宜，效果很差","label":0,"split":"test"},{"text":"再次购买：客服不好","label":0,"split":"test"},{"text":"再次购买：物流很慢","label":0,"split":"test"},{"text":"不是不好用，确实不错","label":1,"split":"valid"},{"text":"看着不错，用着很失望","label":0,"split":"valid"},{"text":"不是不满意，我很喜欢","label":1,"split":"test"},{"text":"物流不错，质量很差","label":0,"split":"test"}],"vocabulary":["不错","满意","喜欢","好用","完整","便宜","很差","失望","破损","慢","退货","不好","质量","物流","价格","客服"]}''')
VOCABULARY = DATA['vocabulary']
REVIEWS = DATA['reviews']

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--lr', type=float, default=0.3)
    parser.add_argument('--epochs', type=int, default=100)
    parser.add_argument('--model', type=Path, help='Replay the frozen browser JSON model')
    parser.add_argument('--output', type=Path, help='Optional destination for the frozen PyTorch state')
    parser.add_argument('--describe', action='store_true')
    args = parser.parse_args()
    if args.describe:
        print(json.dumps({'vocabulary': VOCABULARY, 'counts': {s: sum(r['split'] == s for r in REVIEWS) for s in ['train', 'valid', 'test']}}, ensure_ascii=False))
        return
    if not 0 < args.lr <= 3 or not 1 <= args.epochs <= 10000:
        parser.error('Use 0 < lr <= 3 and 1 <= epochs <= 10000')
    try:
        import torch
        from torch import nn
    except ImportError:
        parser.exit(1, 'PyTorch is required. Follow https://pytorch.org/get-started/locally/\n')
    torch.manual_seed(42)
    torch.set_num_threads(1)
    torch.use_deterministic_algorithms(True)
    model = nn.Sequential(nn.Linear(16, 8), nn.Tanh(), nn.Linear(8, 1))
    loss_fn = nn.BCEWithLogitsLoss()

    def tensors(split):
        rows = [r for r in REVIEWS if r['split'] == split]
        x = torch.tensor([[float(word in r['text']) for word in VOCABULARY] for r in rows])
        y = torch.tensor([[float(r['label'])] for r in rows])
        return rows, x, y

    train_rows, x_train, y_train = tensors('train')
    valid_rows, x_valid, y_valid = tensors('valid')
    if args.model:
        saved = json.loads(args.model.read_text(encoding='utf-8'))
        if saved['vocabulary'] != VOCABULARY:
            raise ValueError('Vocabulary/order differs from this script')
        m = saved['chosen']['model']
        with torch.no_grad():
            model[0].weight.copy_(torch.tensor(m['w1']).T)
            model[0].bias.copy_(torch.tensor(m['b1']))
            model[2].weight.copy_(torch.tensor([m['w2']]))
            model[2].bias.copy_(torch.tensor([m['b2']]))
        best_epoch = saved['chosen']['epoch']
    else:
        optimizer = torch.optim.SGD(model.parameters(), lr=args.lr)
        best_loss, best_state, best_epoch = float('inf'), None, 0
        for epoch in range(1, args.epochs + 1):
            model.train()
            optimizer.zero_grad()
            loss = loss_fn(model(x_train), y_train)
            loss.backward()
            optimizer.step()
            model.eval()
            with torch.no_grad():
                train_loss = loss_fn(model(x_train), y_train).item()
                valid_loss = loss_fn(model(x_valid), y_valid).item()
            if valid_loss < best_loss:
                best_loss, best_state, best_epoch = valid_loss, copy.deepcopy(model.state_dict()), epoch
            if epoch % 10 == 0 or epoch == args.epochs:
                print(f'{epoch:4d} train_loss={train_loss:.4f} valid_loss={valid_loss:.4f}')
        model.load_state_dict(best_state)

    # First evaluation of held-out examples, after the model is frozen.
    test_rows, x_test, y_test = tensors('test')
    model.eval()
    with torch.no_grad():
        logits = model(x_test)
        scores = torch.sigmoid(logits).flatten().tolist()
        test_loss = loss_fn(logits, y_test).item()
    correct = sum(int(score >= .5) == row['label'] for row, score in zip(test_rows, scores))
    print(f'Frozen epoch {best_epoch}; test_loss={test_loss:.4f}; accuracy={correct/len(test_rows):.2%}')
    for row, score in zip(test_rows, scores):
        if int(score >= .5) != row['label']:
            print(f"Error: {row['text']} | label={row['label']} score={score:.4f}")
    if args.model and saved.get('testReport'):
        expected = [r['score'] for r in saved['testReport']['predictions']]
        if len(expected) != len(scores):
            raise ValueError('Export uses a different test dataset')
        assert max(abs(a-b) for a,b in zip(expected, scores)) < 1e-5, 'Browser replay mismatch'
        print('Exported browser predictions matched within 1e-5.')
    if args.output:
        torch.save({'state_dict': model.state_dict(), 'vocabulary': VOCABULARY, 'epoch': best_epoch}, args.output)

if __name__ == '__main__':
    main()
