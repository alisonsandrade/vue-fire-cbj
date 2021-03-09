import { db, auth } from '../plugins/firebase'
import moment from 'moment'

let currentUser = null
auth.onAuthStateChanged(function(user) {
  if (user) {
    currentUser = user
  }
})

const usersRef = db.collection('users')

const partesRef = db.collection('partes')


// Desestrutura o tenantId dinamicamente a parti do usuário atual logado
const getTenantId = async () => {
  const querySnapshot = await usersRef.get(currentUser.uid)

  let users = []
  querySnapshot.forEach(user => {
    if (user.exists) {
      users.push({
        _id: user.id,
        ...user.data()
      })
    }
  })
  const user = users.filter(user => user._id === currentUser.uid)
  return user[0].tenantId
}


const getBloqueios = async (params) => {
  const dataAtual = params || new Date().toISOString().substr(0, 7) // Mês da pesquisa ou mês atual
  
  const tenantId = await getTenantId()

  const querySnapshot = await db.collection(`tenant/${tenantId}/bloqueios`).orderBy('dataRequisicao', 'desc').get()

  let bloqueiosData = []
  querySnapshot.forEach(doc => {
    if (doc.exists) {
      const dataRequisicaoFormatada = doc.data().dataRequisicao.slice(0, 7)
      if (moment(dataRequisicaoFormatada).isSame(dataAtual)) {
        bloqueiosData.push({
          _id: doc.id,
          ...doc.data()
        })
      }
    }
  })

  return bloqueiosData
}

const getPartes = async () => {  
  let partesData = []
  const querySnapshot = await partesRef.orderBy('nome').get()

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

  const tenantId = await getTenantId()

  if (_id) {
    return await db.collection(`tenant/${tenantId}/bloqueios`).doc(_id).update(object)
  } else {
    const data = await db.collection(`tenant/${tenantId}/bloqueios`).add(object)
    return await db.collection(`tenant/${tenantId}/bloqueios`).doc(data.id).set({ _id: data.id }, { merge: true })
  }
}

const updateStatus = async ({_id, status}) => {
  const tenantId = await getTenantId()
  return await db.collection(`tenant/${tenantId}/bloqueios`).doc(_id).set({ status }, { merge: true })
}

const deleteBloqueio = async (id) => {
  const tenantId = await getTenantId()
  await db.collection(`tenant/${tenantId}/bloqueios`).doc(id).delete()
}

const savePartes = async (nomeParte) => await partesRef.add({ nome: nomeParte })

export default {
  getTenantId,
  getBloqueios,
  getPartes,
  saveBloqueios,
  updateStatus,
  deleteBloqueio,
  savePartes
}