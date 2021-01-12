import json
import os
for dirpath, dirnames, filenames in os.walk('.'):
    for name in filenames:
        if not name.endswith('.json'):
            continue
        path = os.path.join(dirpath, name)
        with open(path) as f:
            s = f.read()
        if 'rackcdn' not in s:
            continue
        j = json.loads(s)
        if 'videos' not in j:
            continue
        j['videos'] = [video for video in j['videos']
                       if '.rackcdn.' not in video['url']]
        s = json.dumps(j, indent=2, separators=(',', ': '))
        with open(path, 'w') as f:
            f.write(s + '\n')
