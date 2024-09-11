from schedule import parse_student
from datetime import datetime 


dt = datetime.now().replace(month=12, day=24, hour=12, minute=30, second=0, microsecond=0)

student = parse_student('jason')
print(student.get_current_class(dt))
print(student.get_next_class(dt))
print(student.is_in_break(dt))
print(student.is_on_weekend(dt))
print(student.is_holiday(dt))
print(student.get_holiday_label(dt))