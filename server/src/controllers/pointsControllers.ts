import { Request, Response } from 'express'
import knex from '../database/connection'

class PointsController {

    async index (request: Request, response: Response){
        const { cidade, estado, items } = request.query

        const parsedItems = String(items)
        .split(',')
        .map(item=> Number(item.trim()))

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('cidade', String(cidade))
            .where('estado', String(estado))
            .distinct()
            .select('points.*')

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.100.127:3333/uploads/${point.image}`
            }
        })

        return response.json(points)

    }


    async show (request: Request, response: Response){
        const { id } = request.params

        const point = await knex('points').where('id', id).first()
        
        if(!point) {
            return response.status(400).json({ message: 'point not found!'})
        }

        const serializedPoints = {
            ...point,
            image_url: `http://192.168.100.127:3333/uploads/${point.image}`
            
        }

        const items = await knex('items')
        .join('point_items', 'items.id', '=', 'point_items.item_id')
        .where('point_items.point_id', id)
        .select('items.titulo')

        return response.json({point: serializedPoints,items})
    }

    async create  (request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            cidade,
            estado,
            items
        } = request.body;
    
        const trx = await knex.transaction();

        const point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            cidade,
            estado
        }
    
        const InsertedIds = await trx('points').insert(point)
    
        const point_id = InsertedIds[0]
        console.log(point_id)
    
        const pointItems = items
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map((item_id: number) => {
            return {
                item_id,
                point_id
            }
        })
    
        await trx('point_items').insert(pointItems)
        .then(trx.commit)
        .catch(trx.rollback);
    
        return response.json({
            id: point_id,
            ...point,
        })
    }
}

export default PointsController