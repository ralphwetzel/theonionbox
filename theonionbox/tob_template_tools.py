import math

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
    # Therefore we have to enable this wrong behaviour here!

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
    result = calc_bytes / pow(order_of_magnitude, i)

    if bytes_value < 0:
        result *= -1

    # formatting
    if result >= 99.995 or i == 0:
        return '{:d}{}{}'.format(int(result), separator, abbrevs[i])
    else:
        return '{:.2f}{}{}'.format(result, separator, abbrevs[i])
