import math
import sys
from tob.log import sanitize_for_html

#####
# Python version detection
py = sys.version_info
py30 = py >= (3, 0, 0)

# box_bold_grid = 'col-3 col-md-2 box_bold'
# box_section_grid = 'col-8 col-md-9 box_section'
# box_datum_grid = 'col-3 col-md-2 box_datum'
# box_value_grid = 'col-8 col-md-9 box_value'
# box_title_grid = 'col-8 col-md-9 box_title'
# box_subtitle_grid = 'col-8 col-md-9 box_subtitle'

box_bold_grid = 'col-3 box_bold'
box_section_grid = 'col-7 box_section truncate'
#box_datum_grid = 'col-6 col-md-3 box_datum truncate text-left text-md-right'
box_datum_grid = 'col-3 box_datum truncate'
box_datum_grid_bold = 'col-3 box_datum_bold truncate'
# box_value_grid = 'col-12 col-md-7 box_value'
box_value_grid = 'col-7 box_value'
box_title_grid = 'col-7 box_title truncate'
box_subtitle_grid = 'col-7 box_subtitle'
box_powered_grid = 'col-7 box_powered'
# box_right_grid = 'col-md-2'
box_right_grid = 'col-2'

def standard_row(datum='', value=''):
    out = "<div class='row'>"
    out += "<div class='{}'>{}</div>".format(box_datum_grid, datum)
    out += "<div class='{} box_value_margin'>{}</div>".format(box_value_grid, sanitize_for_html(value))
    out += "<div class='{}'></div>".format(box_right_grid)
    out += "</div>"
    return out


def header_row(bold='', section='', target=''):
    out = "<div class='row hash_target'"
    if target is not '':
        out += " id='{}'".format(target)
    out += "><div class='{}'>{}</div>".format(box_bold_grid, bold)
    out += "<div class='{}'>{}</div>".format(box_section_grid, section)
    out += "<div class='{}'></div>".format(box_right_grid)
    out += "</div>"
    return out


def group_row(title='', color='lightgrey', bold=False, target=''):
    out = """
        <div class = "row" {5}>
            <div class="{0} truncate" style='color: {1};'>
                {2}
            </div>
            <div class="{3} box_value_margin">
                <div class='config_group' style='color: {1};'></div>
            </div>
            <div class="{4}"></div>
        </div>
    """.format(box_datum_grid if bold is False else box_datum_grid_bold
               , color
               , title
               , box_value_grid
               , box_right_grid
               , ('id="' + target + '"') if target is not '' else '')
    return out


# This is the python version of prettyNumber used in the html-template
# Again: Thank's to 'Brennan T' on
# http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript


def pretty_number(bytes_value=0, calc='si', units='si', separator=' '):

    # Handle some special cases
    if bytes_value == 0:
        return '0 Bytes'
    if bytes_value == 1:
        return '1 Byte'
    if bytes_value == -1:
        return '-1 Byte'

    calc_bytes = abs(bytes_value)

    # Attention: arm calculates according IEC, yet displays 'si' - Abbreviations

    if calc == 'si':
        # SI units use the Metric representation based on 10^3 as a order of magnitude
        order_of_magnitude = pow(10, 3)
    else:
        # IEC units use 2^10 as an order of magnitude
        order_of_magnitude = pow(2, 10)

    if units == 'si':
        # SI units use the Metric representation based on 10^3 as a order of magnitude
        abbrevs = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    else:
        # IEC units use 2^10 as an order of magnitude
        abbrevs = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    i = int(math.floor(math.log(calc_bytes) / math.log(order_of_magnitude)))
    result = float(calc_bytes) / pow(order_of_magnitude, i)     # explicit float()-ing necessary to work on linux!

    if bytes_value < 0:
        result *= -1

    # formatting
    if result >= 99.995 or i == 0:
        return '{:d}{}{}'.format(int(result), separator, abbrevs[i])
    else:
        return '{:.2f}{}{}'.format(result, separator, abbrevs[i])

