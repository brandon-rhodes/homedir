import os
from contextlib import contextmanager

n = [1]

@contextmanager
def plot(*args):
    import matplotlib.pyplot as plt
    fig, axes = plt.subplots(*args)
    yield fig, axes
    d = '/home/brandon/Downloads/Debug'
    if not os.path.isdir(d):
        os.mkdir(d)
    fig.savefig(d + '/{:02}.png'.format(n[0]))
    os.utime(d)
    print('Saved {:02}'.format(n[0]))
    n[0] += 1
