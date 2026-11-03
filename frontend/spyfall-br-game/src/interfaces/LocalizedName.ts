// Nome traduzível vindo da API: a chave é o locale ('pt', 'en', ...)
// e o valor é o nome naquele idioma. Ex.: { pt: 'Casa', en: 'House' }
export default interface LocalizedName {
    pt: string,
    en: string,
    [locale: string]: string
}
