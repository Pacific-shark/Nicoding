import json, contextlib, io, sys
with open('work/python-cases.json',encoding='utf-8') as f:
    lessons=json.load(f)
errors=[]
def run(code,tests=()):
    scope={'__name__':'__main__'}
    with contextlib.redirect_stdout(io.StringIO()):
        exec(code,scope)
        for test in tests:
            exec(test,scope)
for lesson in lessons:
    try:
        run(lesson['code'])
    except Exception as error:
        errors.append(f"{lesson['id']} example: {error}")
    c=lesson.get('challenge')
    if c:
        try:
            run(c['solution'],c['tests'])
        except Exception as error:
            errors.append(f"{lesson['id']} solution: {error}")
        try:
            run(c['starter'],c['tests'])
        except Exception:
            pass
        else:
            errors.append(f"{lesson['id']} starter unexpectedly passed")
if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'{len(lessons)} Python examples validated')
