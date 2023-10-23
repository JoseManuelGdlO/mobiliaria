
export const monthToString = (month: number) => {
  switch (month) {
    case 1:
      return 'Enero'
    case 2:
      return 'Febrero'
    case 3:
      return 'Marzo'
    case 4:
      return 'Abril'
    case 5:
      return 'Mayo'
    case 6:
      return 'Junio'
    case 7:
      return 'Julio'
    case 8:
      return 'Agosto'
    case 9:
      return 'Septiembre'
    case 10:
      return 'Octubre'
    case 11:
      return 'Noviembre'
    case 12:
      return 'Diciembre'
    default:
      return ''
  }
}

export const mesEspanol = (mes: string) => {

  if (mes === "Jan") {

    mes = "01"

  } else if (mes === "Feb") {

    mes = "02"

  } else if (mes === "Mar") {

    mes = "03"

  } else if (mes === "Apr") {

    mes = "04"

  } else if (mes === "May") {

    mes = "05"

  } else if (mes === "Jun") {

    mes = "06"

  } else if (mes === "Jul") {

    mes = "07"

  } else if (mes === "Aug") {

    mes = "08"

  } else if (mes === "Sep") {

    mes = "09"

  } else if (mes === "Oct") {

    mes = "10"

  } else if (mes === "Nov") {

    mes = "11"

  } else if (mes === "Dec") {

    mes = "12"

  }
  return mes;

}

export const convertirEspLetra = (dia: string) => {

  if (dia === "Sun") {

    dia = "D"

  } else if (dia === "Mon") {

    dia = "L"

  } else if (dia === "Tue") {

    dia = "M"

  } else if (dia === "Wed") {

    dia = "M"

  } else if (dia === "Thu") {

    dia = "J"

  } else if (dia === "Fri") {

    dia = "V"

  } else if (dia === "Sat") {

    dia = "S"

  }

  return dia;


}
