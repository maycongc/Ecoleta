import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent} from 'leaflet'
import api from '../../services/api'
import axios from 'axios'

import './styles.css'
import logo from '../../assets/logo.svg'

import Dropzone from '../../components/Dropzone'
import Success from '../Success'

interface Item {
    id: number,
    title: string,
    image_url: string
}

interface IbgeUfResponse {
    sigla: string
}

interface IbgeCityResponse {
    nome: string
}

const CreatePoint = () => {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    const [selectedFile, setSelectedFile] = useState<File>()

    const [successScreen, setSuccessScreen] = useState<string>('hide')

    const [items, setItems] = useState<Item[]>([])
    const [selectedItems, setSelectedItems] = useState<number[]>([0])

    const [ufs, setUfs] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([])

    const [selectedUf, setSelectedUF] = useState('0')
    const [selectedCity, setSelectedCity] = useState('0')

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0])

    const history = useHistory()

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude} = position.coords
            setInitialPosition([latitude, longitude])
        })
    }, [])
    
    useEffect(() => {
        api.get('items').then(res => {
            setItems(res.data)
        })
    }, [])

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
            const cityNames = res.data.map(city => city.nome)
            setCities(cityNames)
        })

    }, [selectedUf])

    function handleInputChange (event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target

        setFormData({ ...formData, [name]: value })
    }

    function handleSelectItem (id: number) {
        const alreadySelected = selectedItems.findIndex(itemID => itemID === id)

        if (alreadySelected > -1) {
            const filteredItems = selectedItems.filter(itemId => itemId !== id)
            setSelectedItems(filteredItems)
        } else {
            setSelectedItems([ ...selectedItems, id])
        }

    }

    function handleSelectedUf (event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value
        setSelectedUF(uf)
    }

    function handleSelectedCity (event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value
        setSelectedCity(city)
    }

    function handleMapClick (event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    async function handleSubmit (event: FormEvent) {
        event.preventDefault()

        const { name, email, whatsapp} = formData
        const uf = selectedUf
        const city = selectedCity
        const [latitude, longitude] = selectedPosition
        const items = selectedItems

        const data = new FormData()

        data.append('name', name)
        data.append('email', email)
        data.append('whatsapp', whatsapp)
        data.append('uf', uf)
        data.append('city', city)
        data.append('latitude', String(latitude))
        data.append('longitude', String(longitude))
        data.append('items', items.join(','))
        selectedFile && data.append('image', selectedFile)

        await api.post('points', data)

        setSuccessScreen('')

        setTimeout(() => {
            history.push('/')
        }, 2000);
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />

                <Link to="/">
                    <FiArrowLeft />
                    Voltar Para Home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br /> ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                        <span>Preencha o formulário abaixo</span>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            required
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                required
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                required
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>


                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectedUf}>
                                <option value="0">Selecione</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectedCity}>
                                <option value="0">Selecione</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>


                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">

                        {items.map(item => (
                            <li 
                                key={item.id}
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt={item.title} />
                                <span>{item.title}</span>
                            </li>
                        ))}

                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar Ponto de Coleta
                </button>
            </form>

            <Success hide={successScreen} />
        </div>
    )
}

export default CreatePoint