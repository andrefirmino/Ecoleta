import React, { useState, useEffect, ChangeEvent } from 'react'
import { Feather as Icon } from '@expo/vector-icons'
import { View, ImageBackground, Image, StyleSheet, Text } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios'

interface IBGEEstadoResponse {
  sigla: string
}

interface IBGECidadeResponse {
  nome: string
}

const Home = () => {

    const [estados, setEstados] = useState<string[]>([])
    const [cidades, setCidades] = useState<string[]>([])
    const [selectEstado, setSelectEstado] = useState('0')
    const [selectCidade, setSelectCidade] = useState('0')

    useEffect(()=> {
      axios.get<IBGEEstadoResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      
      const ufInitials = response.data.map( uf => uf.sigla )

      setEstados(ufInitials)    
      
      })
  }, [])

  useEffect(() => {
    if(selectEstado === '0'){
        return
    }

    axios.get<IBGECidadeResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectEstado}/distritos`)
    .then(response => {
        const cityNames = response.data.map( city => city.nome )

        setCidades(cityNames)
    })

  }, [selectEstado])

  const navigation = useNavigation();

  function handleNavigateToPoints(cidade: string, estado: string){
      console.log(cidade)
      console.log(estado)
      navigation.navigate('Points', {cidade: cidade, estado: estado})
    }

  function handleSelectEstado(value:string) {
    const uf = value
    setSelectEstado(uf)
  }

  function handleSelectCidade(value:string){
    const cidade = value

    setSelectCidade(cidade)
  }

    return (
    <ImageBackground 
        source={require('../../assets/home-background.png')} 
        style={styles.container}
        imageStyle={{width: 274, height: 368}}

    >
        <View style={styles.main}>
            <Image source={require('../../assets/logo.png')} />
            <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
            <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente!</Text>
        </View>

        

        <View style={styles.footer}>
        <RNPickerSelect
            
            onValueChange={(value) => {handleSelectEstado(value)}}
            items={estados.map(estado => (
              {label: estado, value:estado}
            ))}
            placeholder= {{ label: 'Escolha uma Estado', value: null}}
        />
        <RNPickerSelect
            onValueChange={(value) => {handleSelectCidade(value)}}
            items={cidades.map(cidade => (
              {label: cidade, value:cidade}
            ))}
            placeholder= {{ label: 'Escolha uma Cidade', value: null}}
        />
          <RectButton style={styles.button} onPress={() => handleNavigateToPoints(selectCidade,selectEstado)}>
            <View style={styles.buttonIcon}>
              <Text>
                <Icon name="arrow-right" color="#FFF" size={24}/>
              </Text>
            </View>
            <Text style={styles.buttonText}>
              Entrar
            </Text>
          </RectButton>
        </View>

    </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32,
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
  
    footer: {},
  
    select: {},
  
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
      marginTop: 8,
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
      color: '#FFF',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    }
  });


export default Home