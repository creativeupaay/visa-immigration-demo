export const keyToName=(key:string):string=>{
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([a-z])([A-Z])/g, '$1 $2')
}