from flask import Blueprint
from flask import flash
from flask import g
from flask import redirect
from flask import render_template
from flask import request
from flask import url_for
from flask import current_app
from werkzeug.exceptions import abort

from .auth import login_required
from .db import get_db
from schedule import parse_student, Student
from datetime import datetime 


bp = Blueprint("timer", __name__)


from datetime import datetime


def create_schedule_context(student: Student):

    if current_app.config['DEBUG']:
        # Before school
        # dt = datetime(2024, 9, 13, 0, 0)

        # During class 
        dt = datetime(2024, 9, 13, 9, 0)

        # During break
        # dt = datetime(2024, 9, 13, 9, 30, 58)

        # Last class of the day
        # dt = datetime(2024, 9, 13, 14, 00)

        # Weekend
        # dt = datetime(2024, 9, 14, 12, 00)

        # Holiday 
        # dt = datetime(2024, 9, 2, 12, 00)
    else:
        dt = datetime.now()

    # Initialize dictionary
    context = {
        'background_color': 'default',  # Background color
        'current_time': dt.timestamp(),
        'end_time': None,  # Time left for the current phase (if applicable)
        'start_time': None,  # Time elapsed in the current class (if applicable)
        'current_class': None,
        'next_class': None,
        'in_class': False,  # Indicate if the student is currently in class
        'in_break': False,  # Indicate if the student is on break
        'before_school': False, # Indicate if it's before the first class
        'no_school': False,  # Indicate if it's a no-school day
        'no_school_label': None,  # Reason for no school
        'weekend': False,  # Indicate if it's a weekend
        'debug': current_app.config['DEBUG']
    }

    # No school or weekend scenarios
    if student.has_no_school(dt):
        if student.is_on_weekend(dt):
            context['weekend'] = True
            context['background_color'] = 'weekend'
        else:
            context['no_school'] = True
            context['background_color'] = 'no-school'
            context['no_school_label'] = student.get_no_school_label(dt)
    else:
        # Get current and next classes
        current_class = student.get_current_class(dt)
        next_class = student.get_next_class(dt)
        context['current_class'] = current_class.name if current_class else None
        context['next_class'] = next_class.name if next_class else None

        # Handle before school
        if student.is_before_school(dt):
            context['background_color'] = 'before-school'
            context['before_school'] = True
            context['end_time'] = student.get_class_start(dt).timestamp()

        # Handle break
        if student.is_in_break(dt):
            context['background_color'] = 'break'
            context['in_break'] = True
            context['end_time'] = student.get_class_start(dt).timestamp()

        # Handle in class
        if current_class:
            context['background_color'] = 'in-class'
            context['in_class'] = True
            context['end_time'] = student.get_class_end(dt).timestamp()
            context['start_time'] = student.get_class_start(dt).timestamp()

    return context


@bp.route("/")
def index():
    """Show all the posts, most recent first."""
    row = g.get('user')
    if row is None:
        return redirect(url_for('auth.login'))
        
    student_name = g.get('user')['username']
    student = parse_student(student_name)

    context = create_schedule_context(student)
    return render_template("timer/index.html", **context)
