import sys
import csv

if len(sys.argv) < 2:
    exit('usage: convert.py <name of CSV file>')

js = """$('span:contains("{NAME}")').closest('tr').find('.MidTermGradeColumn')
        .find('select').val('S1;N;{GRADE}').change();"""

for row in csv.DictReader(open(sys.argv[1])):
    name = row['Last name'] + ', ' + row['First name']
    grade = row['Course total (Letter)']

    if grade == 'F':  # Moodle calls it an "F"
        grade = 'E'   # But the Registrar calls it an "E"

    print(js.format(
        NAME=name,
        GRADE=grade,
    ))
