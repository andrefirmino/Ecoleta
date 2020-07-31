import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import axios from 'axios'
import api from '../../services/api'
import Drozone from '../../components/Dropzone'

import './styles.css'

import logo from '../../assets/logo.svg'

interface Item {
    id: number,
    titulo: string,
    image_url: string,
}

interface IBGEUfResponse {
    sigla: string
}

interface IBGECityResponse {
    nome: string
}


const CreatePoint = () => {

    const [items, setItems] = useState<Item[]>([])
    const [estados, setEstados ] = useState<string[]>([])
    const [cidades, setCidades] = useState<string[]>([])

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    }) 

    const [selectUF, setSelectUf] = useState('0')
    const [selectCidade, setSelectCidade] = useState('0')
    const [selectItems, setSelectItems] = useState<number[]>([])
    const [posicao, setPosicao] = useState<[number, number]>([0,0])
    const [posicaoAtual, setPosicaoAtual] = useState<[number, number]>([0,0])
    const [selectFile, setSelectFile] = useState<File>()

    const history = useHistory()
//Posição atual
    useEffect(()=> {
        navigator.geolocation.getCurrentPosition(position=> {
            const { latitude, longitude } = position.coords
            setPosicaoAtual([latitude, longitude])
        })
    },[])
//Items
    useEffect(()=> {
        api.get('items').then(response => {
            console.log('chegou aqui')
            console.log(response.data)
            setItems(response.data)
        })
    }, [])
//Busca Siglas
    useEffect(()=> {
        axios.get<IBGEUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
        
        const ufInitials = response.data.map( uf => uf.sigla )

        setEstados(ufInitials)    
        
        })
    }, [])
//seleciona Cidades
    useEffect(() => {
        if(selectUF === '0'){
            return
        }

        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectUF}/distritos`)
        .then(response => {
            console.log(response.data)
            const cityNames = response.data.map( city => city.nome )

            setCidades(cityNames)
        })

    }, [selectUF])

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value

        setSelectUf(uf)
    }

    function handleSelectCidade(event: ChangeEvent<HTMLSelectElement>){
        const cidade = event.target.value

        setSelectCidade(cidade)
    }

    function handleMapClick(event: LeafletMouseEvent){
        setPosicao([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    function handleSelectItem(id: number){
        const selecionado = selectItems.findIndex(item=> item === id)

        if(selecionado >= 0){
            const filterItems = selectItems.filter(item => item !== id)
            setSelectItems(filterItems)
        } else {
            setSelectItems([...selectItems, id])
            console.log(selectItems)
        }
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const { name, value } = event.target
        setFormData({...formData, [name]: value})
    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault()

        console.log()

        const { name, email, whatsapp } = formData
        const estado = selectUF
        const cidade = selectCidade
        const [ latitude, longitude ] = posicao
        const items = selectItems

        const data = new FormData();

            data.append('name',name)
            data.append('email',email)
            data.append('whatsapp',whatsapp)
            data.append('estado',estado)
            data.append('cidade',cidade)
            data.append('latitude',String(latitude))
            data.append('longitude',String(longitude))
            data.append('items',items.join(','))
            
            if(selectFile){
                data.append('image',selectFile)
            }

        await api.post('points', data)

        alert('Ponto de coleta criado!')

        history.push('/')

    }

    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do ponto de coleta</h1>

                <Drozone onFileUploaded={setSelectFile}/>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange = {handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email   ">E-mail</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange = {handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange = {handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={posicaoAtual} zoom={16} onClick={handleMapClick}>
                    <TileLayer
                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker position={posicao} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="estado">Estado(UF)</label>
                            <select name="estado" id="estado" value={selectUF} onChange={handleSelectUf}>
                                <option value="0">Selecione um estado</option>
                                {estados.map(estado => (
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="cidade">Cidade</label>
                            <select name="cidade" id="cidade" value={selectCidade} onChange={handleSelectCidade}>
                                <option value="0">Selecione uma Cidade</option>
                                {cidades.map(cidade => (
                                    <option key={cidade} value={cidade}>{cidade}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (
                            <li 
                                key={item.id} 
                                onClick={() => handleSelectItem(item.id)}
                                className={selectItems.includes(item.id) ? 'selected': ''}   
                            >
                            <img src={item.image_url} alt={item.titulo}/>
                            <span>{item.titulo}</span>
                        </li>
                        ))}
                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
}

export default CreatePoint