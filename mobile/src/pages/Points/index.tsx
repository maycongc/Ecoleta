import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native'
import Constants from 'expo-constants'
import { Feather as Icon } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import MapView, { Marker } from 'react-native-maps'
import { SvgUri } from 'react-native-svg'
import * as Location from 'expo-location'
import api from '../../services/api'

interface RouteParams {
    uf: string,
    city: string
}

interface Item {
    id: number,
    title: string,
    image_url: string
}

interface Point {
    id: number,
    image: string,
    image_url: string,
    name: string,
    latitude: number,
    longitude: number
}

const Points = () => {
    const navigation = useNavigation()
    const route = useRoute()
    const routeParams = route.params as RouteParams

    const [items, setItems] = useState<Item[]>([])
    const [selectedItems, setSelectedItems] = useState<number[]>([])

    const [points, setPoints] = useState<Point[]>([])

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])


    useEffect(() => {
        async function loadPosition() {
            const { status } = await Location.requestPermissionsAsync()

            if(status !== 'granted') {
                Alert.alert('Oooops...', 'Precisamos de sua permissão para obter a localização!')
                return
            }

            const location = await Location.getCurrentPositionAsync()
            const { latitude, longitude } = location.coords

            setInitialPosition([latitude, longitude])
        }

        loadPosition()
    } ,[])

    useEffect(() => {
        api.get('points', {
            params: {
                uf: routeParams.uf,
                city: routeParams.city,
                items: selectedItems
            }
        }).then(res => {
            setPoints(res.data)
        })
    }, [selectedItems])

    useEffect(() => {
        api.get('items').then(res => {
            setItems(res.data)
        })
    }, [])

    function handleNavigateBack() {
        navigation.goBack()
    }

    function handleNavigateToDetail(id: number) {
        navigation.navigate('Detail', { point_id: id })
    }

    function handleSelectedItems(id: number) {
        const alreadySelected = selectedItems.includes(id)

        if(alreadySelected) {
            const filteredItems = selectedItems.filter(itemId => itemId !== id)
            setSelectedItems(filteredItems)
        } else {
            setSelectedItems([ ...selectedItems, id])
        }
    }

    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigateBack}>
                    <Icon name="arrow-left" size={24} color="#34cb79" />
                </TouchableOpacity>

                <Text style={styles.title}>Bem Vindo.</Text>
                <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

                <View style={styles.mapContainer}>
                    { initialPosition[0] !== 0 && (
                        <MapView 
                            style={styles.map}
                            initialRegion={{
                                latitude: initialPosition[0],
                                longitude: initialPosition[1],
                                latitudeDelta: 0.025,
                                longitudeDelta: 0.025
                            }}
                        >
                            {points.map(point => (
                                <Marker
                                    key={String(point.id)}
                                    style={styles.mapMarker}
                                    onPress={() => handleNavigateToDetail(point.id)}
                                    coordinate={{
                                        latitude: point.latitude,
                                        longitude: point.longitude
                                    }}
                                >
                                    <View style={styles.mapMarkerContainer} >
                                        <Image style={styles.mapMarkerImage} source={{uri: point.image_url}} />
                                        <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                                    </View>
                                </Marker>
                            ))}
                        </MapView>
                    )}
                </View>
            </View>

            <View style={styles.itemsContainer}>
                <ScrollView 
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 20
                    }}
                >
                    {items.map(item => (
                        <TouchableOpacity 
                            key={String(item.id)}
                            style={[
                                styles.item,
                                selectedItems.includes(item.id) ? styles.selectedItem : {}
                            ]}
                            onPress={() => handleSelectedItems(item.id)}
                            activeOpacity={0.5}
                        >
                            <SvgUri width={42} height={42} uri={item.image_url} />
                            <Text style={styles.itemTitle}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                    
                </ScrollView>
            </View>
        </>
    )
}

export default Points


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    color: '#322153',
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80, 
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
    justifyContent: 'center',
    alignItems: 'center'
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    backgroundColor: '#daf9e8',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});