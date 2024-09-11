from flask import Flask, request
from schedule import parse_student, StudentNotFound
from config import KEY
from datetime import datetime 


def humanize_time(seconds):
    seconds = int(seconds)
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    seconds = seconds % 60

    tokens = []
    if hours:
        tokens.append(f'{hours}h')
    if minutes:
        tokens.append(f'{minutes}m')
    if seconds:
        tokens.append(f'{seconds}s')

    return ' '.join(tokens)


app = Flask(__name__)

@app.route('/<name>')
def shortcut(name):
    if request.args.get('testmode') == 'true' and request.args.get('key') == KEY:
        dt = datetime.now().replace(2024, 9, 11, 14, 8, 0)
    else:
        if request.headers.get('key') != KEY:
            return 'Invalid key;', 403

        dt = datetime.now()


    try:
        student = parse_student(name)
    except StudentNotFound:
        return 'Student not found;', 404

    if student.has_no_school(dt):
        return f'{student.get_no_school_label()};No School!'

    if student.is_on_weekend(dt):
        return 'No School!;Enjoy your weekend!'

    current_class = student.get_current_class(dt)
    next_class = student.get_next_class(dt)

    if student.is_before_school(dt):
        seconds = student.get_time_until_next_class(dt)
        return f'{next_class.name} starts in {humanize_time(seconds)};Have a good day!'

    if student.is_in_break(dt):
        seconds = student.get_time_left_in_break(dt)
        return f'Break ends in {humanize_time(seconds)};Next class is {next_class.name}'

    if current_class is not None and next_class is not None:
        seconds = student.get_time_left_in_class(dt)
        return f'{current_class.name} ends in {humanize_time(seconds)};Next class is {next_class.name}'
    
    elif current_class is not None and next_class is None:
        seconds = student.get_time_left_in_class(dt)
        return f'{current_class.name} ends in {humanize_time(seconds)};No more classes today'

    elif current_class is None and next_class is None:
        return 'No more classes today!;'

    return 'mystery;'


if __name__ == '__main__':
    app.run()
