"""Numerical and data-boundary checks for the model actually shipped to learners."""
from pathlib import Path
import copy
import hashlib
import importlib.util
import json
import sys
import unittest
import zipfile
import numpy as np
sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[1]
FOLDER = ROOT / 'public/learning/bank'
spec = importlib.util.spec_from_file_location('bank', FOLDER/'model.py')
bank = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bank)
ROWS = bank.load_rows((FOLDER/'bank.csv').read_text(encoding='utf-8'))
CONFIG = dict(lr=.3, l2=.01, epochs=150, categorical=True)

class BankChecks(unittest.TestCase):
    def test_dataset_and_split_boundary(self):
        self.assertEqual(len(ROWS), 4521)
        self.assertEqual(hashlib.sha256((FOLDER/'bank.csv').read_bytes()).hexdigest(), 'dc8d576e9bda0f41ee891251bd84bab9a39ce576cba715aac08adc2374a01fde')
        splits=bank.split_rows(ROWS)
        self.assertEqual({k:len(v) for k,v in splits.items()},dict(train=3171,valid=674,test=676))
        keys={k:{bank.group_key(r) for r in v} for k,v in splits.items()}
        for a,b in [('train','valid'),('train','test'),('valid','test')]:
            self.assertFalse(keys[a] & keys[b])
        all_ids=[r['_id'] for group in splits.values() for r in group]
        self.assertEqual(len(set(all_ids)),4521)

    def test_finite_difference_and_stable_extremes(self):
        x=np.array([[1.,-2.],[.3,.8],[-.4,.7]])
        y=np.array([1.,0.,1.]); w=np.array([.2,-.4]); b=.3; reg=.07; eps=1e-6
        gw,gb=bank.gradients(x,y,w,b,reg)
        for i in range(2):
            delta=np.eye(2)[i]*eps
            approx=(bank.objective(x,y,w+delta,b,reg)-bank.objective(x,y,w-delta,b,reg))/(2*eps)
            self.assertAlmostEqual(approx,gw[i],places=7)
        self.assertAlmostEqual((bank.objective(x,y,w,b+eps,reg)-bank.objective(x,y,w,b-eps,reg))/(2*eps),gb,places=7)
        self.assertTrue(np.isfinite(bank.sigmoid([-10000,0,10000])).all())

    def test_heldout_labels_do_not_train_or_change_split(self):
        first=bank.train(ROWS,CONFIG)
        altered=copy.deepcopy(ROWS)
        heldout={r['_id'] for k,v in bank.split_rows(ROWS).items() if k!='train' for r in v}
        for row in altered:
            if row['_id'] in heldout: row['y']='no' if row['y']=='yes' else 'yes'
            row['duration']='999999'
        second=bank.train(altered,CONFIG)
        self.assertEqual(first['weights'],second['weights'])
        self.assertEqual(first['bias'],second['bias'])
        self.assertEqual(first['prep'],second['prep'])
        self.assertEqual(first['counts'],second['counts'])
        self.assertNotEqual(first['validation']['logloss'],second['validation']['logloss'])

    def test_preprocessing_and_reproducibility(self):
        train=bank.split_rows(ROWS)['train']
        prep=bank.fit_preprocessor(train)
        altered=copy.deepcopy(train[:1]); altered[0]['job']='never-seen'
        matrix=bank.transform(altered,prep)
        job_start=3
        self.assertTrue((matrix[0,job_start:job_start+len(prep['categories']['job'])]==0).all())
        self.assertFalse(any('duration' in feature or feature=='y' for feature in prep['features']))
        first=bank.train(ROWS,CONFIG); second=bank.train(ROWS,CONFIG)
        self.assertEqual(first['history'],second['history'])
        self.assertEqual(first['weights'],second['weights'])
        self.assertLess(first['history'][-1]['train'],first['history'][0]['train'])
        self.assertLess(first['validation']['logloss'],first['baseline']['logloss'])
        self.assertEqual(bank.train(ROWS,{**CONFIG,'categorical':False})['counts'],first['counts'])
        result=bank.test_run(ROWS,first,.2,1,5)
        self.assertEqual(result['metrics']['n'],676)
        expected={r['_id'] for r in bank.split_rows(ROWS)['test']}
        self.assertEqual({r['id'] for r in result['predictions']},expected)

    def test_metrics_edge_cases(self):
        m=bank.metrics([1,0],[.1,.2],.5)
        self.assertIsNone(m['precision'])
        self.assertEqual(m['recall'],0)
        m=bank.metrics([1,0],[.5,.5],.5,2,9)
        self.assertEqual((m['tp'],m['fp'],m['cost']),(1,1,2))

    def test_download_matches_shipped_sources(self):
        with zipfile.ZipFile(FOLDER/'nicoding-bank-lab.zip') as z:
            for name in z.namelist():
                self.assertEqual(z.read(name),(FOLDER/name).read_bytes(),name)

if __name__ == '__main__':
    unittest.main(verbosity=2)
