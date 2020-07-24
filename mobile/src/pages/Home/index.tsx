import React, { useEffect, useState } from 'react'
import { View, Image, ImageBackground, StyleSheet, Text, Alert } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'
import { Feather as Icon } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { Picker } from '@react-native-community/picker'
import axios from 'axios'

interface IbgeUfResponse {
    sigla: string
}

interface IbgeCityResponse {
    nome: string
}

const Home = () => {
    const navigation = useNavigation()

    const [ufs, setUfs] = useState<string[]>([])
    const [selectedUf, setSelectedUf] = useState('0')

    const [cities, setCities] = useState<string[]>([])
    const [selectedCity, setSelectedCity] = useState('0')

    const [enabledPickerCity, setEnabledPickerCity] = useState(false)

    useEffect(() => {
        axios.get<IbgeUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res => {
            let ufInitials = res.data.map(uf => uf.sigla)

            for(let i = 0; i < ufInitials.length; i++)
                for(let j = i + 1; j < ufInitials.length; j++)
                    ufInitials[i] > ufInitials[j] && ([ufInitials[i], ufInitials[j]] = [ufInitials[j], ufInitials[i]])

            setUfs(ufInitials)
        })
    }, [])

    useEffect(() => {
        if (selectedUf === '0') return

        axios.get<IbgeCityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(res => {
            const citiesNames = res.data.map(city => city.nome)

            setCities(citiesNames)
            setEnabledPickerCity(true)
        })
    }, [selectedUf])

    function handleNavigationToPoints() {

        if(selectedCity === '0' || selectedUf === '0') return Alert.alert('Ooops...', 'É necessário selecionar o Estado e a Cidade!') 

        navigation.navigate('Points', { uf: selectedUf, city: selectedCity})
    }

    function handleSelectedtUf(uf: string) {
        setSelectedUf(uf)
    }

    function handleSelectedtCity(city: string) {
        setSelectedCity(city)
    }

    return (
        <ImageBackground 
            source={require('../../assets/home-background.png')}
            style={styles.container}
            imageStyle={{
                width: 274,
                height: 368
            }}
        >
            <View style={styles.main}>
                <Image source={require('../../assets/logo.png')} />
                <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
                <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de resíduos de forma eficiente.</Text>
            </View>

            <View style={styles.footer}>
                
                <Picker
                    selectedValue={selectedUf}
                    style={styles.select}
                    onValueChange={(itemValue) => handleSelectedtUf(String(itemValue))}
                >
                    <Picker.Item color='#9e9e9e' value='0' label='Selecione o Estado' />

                    {ufs.map(uf => (
                        <Picker.Item color='#34CB79' key={uf} value={uf} label={uf} />
                    ))}
                </Picker>

                <Picker
                    enabled={enabledPickerCity}
                    selectedValue={selectedCity}
                    style={styles.select}
                    onValueChange={(itemValue) => handleSelectedtCity(String(itemValue))}
                >
                    <Picker.Item color='#9e9e9e' value='0' label='Selecione a Cidade' />

                    {cities.map(city => (
                        <Picker.Item color='#34CB79' key={city} value={city} label={city} />
                    ))}
                </Picker>

                <RectButton style={styles.button} onPress={handleNavigationToPoints}>
                    <View style={styles.buttonIcon}>
                        <Text>
                            <Icon name="arrow-right" color="#fff" size={28} />
                        </Text>
                    </View>
                    <Text style={styles.buttonText}>
                        Encontrar pontos de coleta
                    </Text>
                </RectButton>
            </View>
        </ImageBackground>
    )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32
    },

    main: {
        flex: 1,
        justifyContent: 'center',
    },

    title: {
        color: '#322153',
        fontSize: 32,
        fontFamily: 'Ubuntu_700Bold',
        maxWidth: 260,
        marginTop: 64,
    },

    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 16,
        fontFamily: 'Roboto_400Regular',
        maxWidth: 260,
        lineHeight: 24,
    },

    footer: {
        alignItems: 'center',
        justifyContent: 'center'
    },

    select: {
        height: 55,
        width: 250,
        marginBottom: 16,
        alignContent: 'center'
    },

    input: {
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 8,
        paddingHorizontal: 24,
        fontSize: 16,
    },

    button: {
        backgroundColor: '#34CB79',
        height: 60,
        flexDirection: 'row',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
        marginTop: 32,
    },

    buttonIcon: {
        height: 60,
        width: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    buttonText: {
        flex: 1,
        justifyContent: 'center',
        textAlign: 'center',
        marginRight: 24,
        color: '#FFF',
        fontFamily: 'Roboto_500Medium',
        fontSize: 20,
    }
});