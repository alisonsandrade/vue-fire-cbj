import { db } from '../plugins/firebase'

const bloqueiosRef = db.collection('bloqueios')
const partesRef = db.collection('partes')

const getBloqueios = async () => {  
  let bloqueiosData = []
  const querySnapshot = await bloqueiosRef.get()

  querySnapshot.forEach(doc => {
    bloqueiosData.push({
      _id: doc.id,
      ...doc.data()
    })
  })

  return bloqueiosData
}

const getPartes = async () => {  
  let partesData = []
  const querySnapshot = await partesRef.get()

  querySnapshot.forEach(doc => {
    partesData.push({
      _id: doc.id,
      ...doc.data()
    })
  })

  return partesData
}

const saveBloqueios = async (object) => {
  const { _id } = object

  if (_id) {
    return await bloqueiosRef.doc(_id).update(object)
  } else {
    const data = await bloqueiosRef.add(object)
    return await bloqueiosRef.doc(data.id).set({ _id: data.id }, { merge: true })
  }
}

const updateStatus = async ({_id, status}) => {
  return await bloqueiosRef.doc(_id).set({ status }, { merge: true })
}

const deleteBloqueio = async (id) => await bloqueiosRef.doc(id).delete()

const savePartes = async (nomeParte) => await partesRef.add({ nome: nomeParte })

export default {
  getBloqueios,
  getPartes,
  saveBloqueios,
  updateStatus,
  deleteBloqueio,
  savePartes
}