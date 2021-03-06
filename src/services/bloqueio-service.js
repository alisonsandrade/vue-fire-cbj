import firebase from '../plugins/firebase'

const db = firebase.firestore()
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
  const data = await bloqueiosRef.add(object)
  console.log('data', data.get())
  return
}

const savePartes = async (object) => {
  const data = await partesRef.add(object)
  console.log('data', data.get())
  return
}

export default {
  getBloqueios,
  getPartes,
  saveBloqueios,
  savePartes
}