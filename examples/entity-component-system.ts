import {Entity, SecondaryMap, SlotMap} from '../src/lib.ts'

const entities = new SlotMap<string>()
const owners = new SecondaryMap<Entity>()

const human1 = entities.insert("Sunny")
const human2 = entities.insert("Billy")
const human3 = entities.insert("Christine")

const cat1 = entities.insert("Socks")
owners.insert(cat1, human1)

const cat2 = entities.insert("Allie")
owners.insert(cat2, human3)

const cat3 = entities.insert("Cali")
owners.insert(cat3, human2)

for (const [entity, name] of entities.iter()) {
    const owner = owners.get(entity)
    if (owner) {
        const ownerName = entities.get(owner)
        if (ownerName) {
            console.log(`The owner of ${name} is ${ownerName}`)
        } else {
            console.log(`The owner of ${name} does not have a name`)
        }
    } else {
        console.log(`${name} does not have an owner`)
    }
}