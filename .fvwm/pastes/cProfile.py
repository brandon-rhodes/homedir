import cProfile, pstats
cProfile.run('f()', 'tmp.stats')
p = pstats.Stats('tmp.stats')
p.strip_dirs().sort_stats('cumtime').print_stats()
