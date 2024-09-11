from flask import Flask, request
from schedule import parse_student, StudentNotFound
from config import KEY


def humanize_time(seconds):
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
    if request.headers.get('key') != KEY:
        return 'Invalid key;', 403

    try:
        student = parse_student(name)
    except StudentNotFound:
        return 'Student not found;', 404

    if student.is_on_weekend():
        return 'No School!;Enjoy your weekend!'
    
    if student.is_on_holiday():
        return f'{student.get_holiday_label()};No School!'

    current_class = student.get_current_class()
    next_class = student.get_next_class()

    if student.is_in_break():
        seconds = student.get_time_left_in_break()
        return f'Break ends in {humanize_time(seconds)};Next class is {next_class.name}'

    if current_class is not None and next_class is not None:
        seconds = student.get_time_left_in_class()
        return f'Class ends in {humanize_time(seconds)};Next class is {next_class.name}'
    
    elif current_class is None and next_class is not None:
        seconds = student.get_time_until_next_class()
        return f'First class starts in {humanize_time(seconds)};{next_class.name}'

    elif current_class is not None and next_class is None:
        seconds = student.get_time_left_in_class()
        return f'Class ends in {humanize_time(seconds)};No more classes today'

    elif current_class is None and next_class is None:
        return 'No more classes today!;'
        

    return student.get_current_class()


if __name__ == '__main__':
    app.run()
