#!uv run
#
# /// script
# requires-python = ">=3.8"
# dependencies = [
#     "imageio",
#     "numpy",
# ]
# ///

import imageio.v3 as iio
import numpy as np
from pathlib import Path

def main():
    d = Path('/home/brandon/.cache/ting')
    paths = d.glob('chart-*.png')
    paths = sorted(paths)
    for path in paths:
        f = path.name
        i = f.index('-')
        j = f.index('.')
        date = f[i+1:j]
        n = count_drops_in_image(path)
        print(date, '*' * n)

def count_drops_in_image(path):
    im = iio.imread(path)

    im = im[:,:,:3]             # remove alpha channel
    im = im.sum(axis=2)         # sum colors to convert to black and white
    im = (im == 0)              # convert to bitmap with black pixels == 1

    # Trim away the axis labels.

    y = im.sum(axis=1)
    value = y.max()
    [hline_indices] = np.nonzero(y == value)
    assert len(hline_indices) == 4
    i = hline_indices[1]
    j = hline_indices[2]

    im = im[i+1:j, :]

    x = im.sum(axis=0)
    value = x.max()
    [vline_indices] = np.nonzero(x == value)
    assert len(vline_indices) == 4
    i = vline_indices[1]
    j = vline_indices[2]

    im = im[:, i+1:j]

    # Look for voltage drops.

    x = im.sum(axis=0)
    [drops] = (x > 100).nonzero()
    spacing = np.diff(drops, prepend=0)
    drops = drops[spacing > 1]

    # Return how many drops there were.

    return len(drops)

if __name__ == '__main__':
    main()

