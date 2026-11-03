import LocalizedName from '../interfaces/LocalizedName'

// Resolve o nome exibido para o idioma atual: usa o locale pedido,
// cai para 'pt', depois 'en', depois qualquer tradução disponível.
// Aceita string por robustez (dados antigos em cache, por exemplo).
export function localizedName(name: LocalizedName | string | undefined, language: string): string {
    if (!name) {
        return ''
    }
    if (typeof name === 'string') {
        return name
    }
    const locale = language?.toLowerCase().startsWith('en') ? 'en' : 'pt'
    return name[locale] ?? name.pt ?? name.en ?? Object.values(name)[0] ?? ''
}
