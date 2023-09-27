import numpy as np
t = np.arange(0.0, 2.0, 0.01)
s = 1 + np.sin(2 * np.pi * t)

import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.plot(t, s, label='label', linestyle='--')
ax.grid()
#ax.set(xlabel='time (s)', ylabel='voltage (mV)', title='Title')
#ax.set_aspect(aspect=1.0)
#ax.axhline(1.0); ax.axvline(1.0); ax.set_xlim(10, 20)
#plt.legend()
fig.savefig('tmp.png')
