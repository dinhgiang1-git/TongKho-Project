const LocalStorage = {
  getNameGuest: () => localStorage.getItem('guest'),
  setNameGuest: (token: string) => localStorage.setItem('guest', token),
  getToken: () => localStorage.getItem('token'),
  setToken: (token: string) => localStorage.setItem('token', token),
  removeToken: () => localStorage.removeItem('token'),
  getMap: () => localStorage.getItem('map'),
  setMap: (token: string) => localStorage.setItem('map', token),
  getRole: () => localStorage.getItem('role'),
  getData: () => localStorage.getItem('data'),
  setRole: (token: string) => localStorage.setItem('role', token),
  setData: (token: any) => localStorage.setItem('data', token)
}

export default LocalStorage
