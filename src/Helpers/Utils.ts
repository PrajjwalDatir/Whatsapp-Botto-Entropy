import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import axios from 'axios'
import { format } from 'util'
export default class Util {
    public format = format

    public fetch = async <T>(url: string): Promise<T> => (await axios.get<T>(url)).data

    public fetchBuffer = async (url: string): Promise<Buffer> =>
        (await axios.get<Buffer>(url, { responseType: 'arraybuffer' })).data

    public isTruthy = <T>(value: T | null | undefined): value is T => value !== null && value !== undefined

    public readdirRecursive = (directory: string): string[] => {
        const results: string[] = []

        const read = (path: string): void => {
            const files = readdirSync(path)

            for (const file of files) {
                const dir = join(path, file)
                if (statSync(dir).isDirectory()) read(dir)
                else results.push(dir)
            }
        }
        read(directory)
        return results
    }

    public getRandomInt = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    public getRandomFloat = (min: number, max: number): number => {
        return Math.random() * (max - min) + min
    }
}
