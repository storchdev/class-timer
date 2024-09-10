from schedule import parse_student
from datetime import datetime 


dt = datetime.now().replace(hour=9)

student = parse_student('hudson')
print(student.get_current_class(dt))
print(student.get_next_class(dt))
print(student.is_in_break(dt))
print(student.is_on_weekend(dt))
print(student.is_holiday(dt))
print(student.get_holiday_label(dt))