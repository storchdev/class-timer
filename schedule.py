import re 
from datetime import datetime, timedelta, time
from typing import List, Dict, Optional, Tuple
from zoneinfo import ZoneInfo

class StudentNotFound(Exception):
    pass

class SchoolNotFound(Exception):
    pass

class DayNotFound(Exception):
    pass


class Class:
    def __init__(self, name: str, start: time, end: time):
        self.name = name
        self.start = start
        self.end = end

    def __repr__(self):
        return f"Class(name='{self.name}', start={self.start}, end={self.end})"


class Day:
    def __init__(self, weekday: int, monthday: Optional[Tuple[int, int]] = None):
        self.weekday = weekday
        self.monthday = monthday
        self.classes: List[Class] = []
        self.label: str = None

    def __repr__(self):
        return (f"Day(weekday={self.weekday}, monthday={self.monthday}, "
                f"classes={self.classes}, label={self.label})")


class Student:
    def __init__(self, name: str):
        self.name = name
        self.school: School = None
        self.weekdays: Dict[int, Day] = {}
        self.special_days: Dict[Tuple[int, int], Day] = {}
        self.timezone = ZoneInfo("US/Eastern") 

    def __repr__(self):
        return (f"Student(name='{self.name}', school={self.school}, "
                f"weekdays={self.weekdays}, special_days={self.special_days})")

    def _timezonify(self, dt: Optional[datetime] = None) -> datetime:
        if dt is None:
            return datetime.now(self.timezone)
        else:
            return dt.astimezone(self.timezone)

    def _get_day(self, dt) -> Optional[Day]:
        special_day = self.special_days.get((dt.month, dt.day))
        if special_day:
            return special_day 
        else:
            if dt.weekday() not in self.weekdays:
                return None

            return self.weekdays[dt.weekday()]
    
    def get_current_class(self, dt: Optional[datetime] = None):
        dt = self._timezonify(dt)
        for classs in self._get_day(dt).classes:
            if classs.start < dt.time() < classs.end:
                return classs
        
        return None 
    
    def get_next_class(self, dt: Optional[datetime] = None):
        dt = self._timezonify(dt)
        classes = self._get_day(dt).classes
        for classs in classes:
            if classs.start > dt.time():
                return classs
        
        return None 
    
    def is_before_school(self, dt: Optional[datetime] = None) -> bool:
        dt = self._timezonify(dt)
        classes = self._get_day(dt).classes 
        return dt.time() < classes[0].start

    def is_in_break(self, dt: Optional[datetime] = None):
        return self.get_current_class(dt) is None and self.get_next_class(dt) is not None 

    def get_time_left_in_class(self, dt: Optional[datetime] = None):
        dt = self._timezonify(dt)
        current_class = self.get_current_class(dt)
        if current_class is None:
            return None

        return (datetime.combine(dt, current_class.end, self.timezone) - dt).total_seconds()

    def get_time_until_next_class(self, dt: Optional[datetime] = None):
        dt = self._timezonify(dt)
        next_class = self.get_next_class(dt)
        if next_class is None:
            return None
        
        return (datetime.combine(dt, next_class.start, self.timezone) - dt).total_seconds()

    def get_time_left_in_break(self, dt: Optional[datetime] = None):
        dt = self._timezonify(dt)
        if not self.is_in_break(dt):
            return None 
        
        next_class = self.get_next_class(dt)
        return (datetime.combine(dt, next_class.start, self.timezone) - dt).total_seconds()

    def has_no_school(self, dt: Optional[datetime] = None):
        day = self._get_day(self._timezonify(dt))
        return len(day.classes) == 0

    def get_no_school_label(self, dt: Optional[datetime] = None):
        if not self.has_no_school(dt):
            return None 
        return self._get_day(self._timezonify(dt)).label
    
    def is_on_weekend(self, dt: Optional[datetime] = None):
        dt = self._timezonify(dt)
        return dt.weekday() in (5, 6)
    

class School:
    def __init__(self, name: str):
        self.name = name
        self.special_days: Dict[Tuple[int, int], Day] = {}

    def __repr__(self):
        return f"School(name='{self.name}', special_days={self.special_days})"


def parse_day(day_str: str):
    parsed_date = datetime.strptime(day_str, '%m/%d')
    parsed_date = parsed_date.replace(year=datetime.now().year)
    today = datetime.now()
    if parsed_date < today:
        parsed_date = parsed_date.replace(year=today.year + 1)
    return parsed_date 


def parse_school(school_name, filename='schools.schedule') -> School: # -> Dict[str, Dict[str, datetime]]:
    school = School(school_name)

    with open(filename) as f:
        lines = f.read().split('\n')
        for n, line in enumerate(lines):
            if line.rstrip() == school_name + ':':
                break 
        else:
            raise SchoolNotFound(f'school "{school_name}" not found')

        for n in range(n+1, len(lines)):
            line = lines[n]

            # Ignore comments and blank lines
            if line.strip() == '' or line.strip().startswith('#'):
                continue 
            
            # Calculate indent
            line = line.rstrip()
            spaces = len(line) - len(line.strip(' '))

            # Remove indent
            line = line.strip()

            if spaces == 0:
                break 

            if spaces == 4:
                # One day
                if re.match(r'\d\d?/\d\d?:', line):
                    current_days = [parse_day(line.removesuffix(':'))]

                # Range of days
                match = re.match(r'(\d\d?/\d\d?)\s?-\s?(\d\d?/\d\d?)', line)
                if match:
                    day_start = parse_day(match.group(1))
                    day_end = parse_day(match.group(2))
                    day = day_start 
                    current_days = [day]
                    while (day.month, day.day) != (day_end.month, day_end.day):
                        day += timedelta(days=1)
                        current_days.append(day)

            elif spaces == 8:
                if current_days is None:
                    raise IndentationError(f'Unexpected indent in line {n+1} of {filename}')

                # Move the label to all days in the range 
                for day_dt in current_days:
                    monthday = (day_dt.month, day_dt.day)
                    day = Day(day_dt.weekday(), monthday)
                    day.label = line
                    school.special_days[monthday] = day
                    current_days = None 
    
    return school 


def parse_student(student_name: str, filename='students.schedule'):
    student = Student(student_name)
    student_vars = {}

    def unvar(string):
        if string in student_vars:
            return student_vars[string]
        return string
     
    with open(filename) as f:
        lines = f.read().split('\n')
        for n, line in enumerate(lines):
            if line.rstrip() == student_name+':':
                break 
        else:
            raise StudentNotFound(f'student "{student_name}" not found')

        current_day = None  
        for n in range(n+1, len(lines)):
            line = lines[n]

            # Ignore comments and blank lines
            if line.strip() == '' or line.strip().startswith('#'):
                continue 
            
            # Calculate indent
            line = line.rstrip()
            spaces = len(line) - len(line.strip(' '))

            # Remove indent
            line = line.strip()

            if spaces == 0:
                break 

            if spaces == 4:
                match = re.match(r'([a-zA-Z0-9_-]+)\s*=\s*(.+)', line)
                if match:
                    var_name = match.group(1)
                    var_value = match.group(2)
                    student_vars[var_name] = var_value 
                    continue
                
                # Weekdays
                match = re.match(r'(\w+day):', line)
                if match:
                    day_name = match.group(1) 

                    table = {
                        'monday': 0,
                        'tuesday': 1,
                        'wednesday': 2,
                        'thursday': 3,
                        'friday': 4,
                        'saturday': 5,
                        'sunday': 6
                    }

                    weekday = table[day_name]
                    current_day = Day(weekday)
                    student.weekdays[weekday] = current_day 

                    continue

                # One special day
                if re.match(r'\d\d?/\d\d?:', line):
                    dt = parse_day(line.removesuffix(':'))
                    monthday = (dt.month, dt.day)

                    if monthday not in student.special_days:
                        current_day = Day(dt.weekday(), monthday)
                        student.special_days[monthday] = current_day

                    continue

                if line.startswith('school:'):
                    if student.school is not None:
                        raise KeyError("school already set")

                    school_name = line.removeprefix('school:').strip() 
                    school = parse_school(school_name)
                    student.school = school

                    # fetch special days from school but don't override
                    for monthday, day in student.school.special_days.items():
                        if monthday not in student.special_days:
                            student.special_days[monthday] = day

            elif spaces == 8:
                if current_day is None:
                    raise IndentationError(f'Unexpected indent in line {n+1} of {filename}') 

                # Full day event
                if '@' not in line:
                    current_day.label = line
                    continue 
                
                name, period = re.split(r'\s*@\s*', line)
                name = unvar(name)

                def parse_time(time_str):
                    t = datetime.strptime(time_str, '%H:%M').time()
                    if 1 <= t.hour <= 6:
                        t = t.replace(hour=t.hour + 12)
                    return t

                def parse_period(period_str):
                    start, end = re.split(r'\s*-\s*', period_str)
                    start = unvar(start)
                    end = unvar(end)
                    
                    return parse_time(start), parse_time(end)

                sub_periods = re.split(r'\s*\+\s*', period)
                first = sub_periods[0]
                last = sub_periods[-1]

                first = unvar(first)
                last = unvar(last)

                start = parse_period(first)[0]
                end = parse_period(last)[1]

                current_day.classes.append(Class(name, start, end))
        
    return student
