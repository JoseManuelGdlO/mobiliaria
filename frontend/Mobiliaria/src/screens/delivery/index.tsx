import { convertirEspLetra, mesEspanol } from "@utils/dateFormat"
import React, { useEffect } from "react"
import { Text, TouchableOpacity, View } from 'react-native'

export interface IDays {
    date?: string 
    letter?: string
    dayNumber?: string
    month?: string
    year?: string
    requestdate?: string
}

const Delivery = (): JSX.Element => {
    const [day1, setDay1] = React.useState<IDays>()
    const [day2, setDay2] = React.useState<IDays>()
    const [day3, setDay3] = React.useState<IDays>()
    const [day4, setDay4] = React.useState<IDays>()
    const [day5, setDay5] = React.useState<IDays>()

    const getDates = () => {
        const today = new Date().toString()
        let day1: IDays = {}

        day1.date = today
        day1.letter = today.substr(0, 3) 
        day1.letter = convertirEspLetra(day1.letter)
        day1.dayNumber = today.substr(8, 2)
        day1.month = today.substr(4, 3);
        day1.month = mesEspanol(day1.month)
        day1.year = today.substr(11, 4)

        day1.requestdate = `${day1.year}-${day1.month}-${day1.dayNumber}`

        setDay1(day1)
        console.log(day1);
        

    }

    useEffect(() => {
        getDates()
    }, [])

    return (
        <View style={{ backgroundColor: '#f2edd9', height: '100%'}}>
            <View style={{ display: 'flex', flexDirection: 'row' }}>
                <TouchableOpacity style={{width: '20%', height: 70, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'blue'}}>
                    <Text>1</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{width: '20%', height: 70, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'blue'}}>
                    <Text>2</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{width: '20%', height: 70, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'blue'}}>
                    <Text>3</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{width: '20%', height: 70, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'blue'}}>
                    <Text>4</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{width: '20%', height: 70, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'blue'}}>
                    <Text>5</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
export default Delivery