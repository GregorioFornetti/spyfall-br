import { useEffect, useState } from "react";

import MultiSelect, { Option } from "../../../Multiselect";
import Category from '../../../../interfaces/CategoryInterface';
import Place from '../../../../interfaces/PlaceInterface';
import Config from '../../../../interfaces/ConfigInterface';
import PlaceCard from '../../../PlaceCard';
import { BsArrowDownUp } from "react-icons/bs";
import { useTranslation } from 'react-i18next';
import { localizedName } from '../../../../utils/localizedName';

interface PlaceSelectorProps {
    categories: Category[],
    config: Config,
    setConfig: React.Dispatch<React.SetStateAction<Config>>,
    places: Place[],
    disabled?: boolean
}

export default function PlaceSelector({categories, config, places, setConfig, disabled}: PlaceSelectorProps) {

    const { t, i18n } = useTranslation()
    const options = categories.map((category) => ({value: category.id, label: localizedName(category.name, i18n.language)}))
    const [selectedCategories, setSelectedCategories] = useState<any>([]);

    useEffect(() => {
        // Essa função atualizará as categorias selecionadas de acordo com os lugares selecionados
        // É necessário fazer isso sempre que os lugares selecionados forem alterados

        const selectedCategories: any = {}  // Objeto no seguinte padrão: {<id_categoria>: boolean - true se todos os lugares dessa categoria estiverem selecionados, false caso contrário}

        // Inicialmente todas as categorias estão selecionadas
        for (let category of categories) {
            selectedCategories[category.id] = true
        }

        // Todo lugar não selecionado, desmarca as categorias dele
        for (let place of places) {
            if (!config.selectedPlacesIds.includes(place.id)) {
                for (let categoryId of place.categoriesIds) {
                    selectedCategories[categoryId] = false
                }
            }
        }

        const selectedCategoriesIds = Object.keys(selectedCategories).filter((categoryId) => selectedCategories[categoryId])
        setSelectedCategories(options.filter((option) => selectedCategoriesIds.includes(option.value.toString())))
    }, [config.selectedPlacesIds, categories])

    const placesGrid = (filtered: Place[], onPick: (place: Place) => void) => (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((place) => (
                <PlaceCard
                    type={disabled ? 'selected' : 'option'}
                    title={localizedName(place.name, i18n.language)}
                    key={place.id}
                    imgURL={place.imgPath}
                    onClick={disabled ? undefined : () => onPick(place)}
                />
            ))}
            {filtered.length === 0 &&
                <p className="py-6 text-center text-sm text-zinc-500 sm:col-span-2 xl:col-span-3">{t('config.noPlaces')}</p>
            }
        </div>
    )

    return (
        <>
            <section className="mt-4 overflow-hidden rounded-xl border border-zinc-200">
                <header className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-center">
                    <h4 className="mb-3 text-base font-semibold">{t('config.selectedPlaces', { count: config.selectedPlacesIds.length })}</h4>
                    <MultiSelect
                        options={options}
                        selected={selectedCategories}
                        setSelected={setSelectedCategories}
                        title={t('config.selectByCategories')}
                        onChange={(newValue, actionMeta, selectAllOption) => {

                            const {action, option, removedValue} = actionMeta;
                            const opt = option as Option
                            const removed = removedValue as Option

                            // Todas as categorias foram selecionadas, logo, todos locais também devem ser selecionados
                            if (action === 'select-option' && opt.value === selectAllOption.value) {
                                config.selectedPlacesIds = places.map((place) => place.id);
                                setConfig({...config});
                            }

                            // Todas as categorias foram deselecionadas, logo, todos locais também devem ser deselecionados
                            else if ((action === 'deselect-option' && opt.value === selectAllOption.value) || (action === 'remove-value' && removed.value === selectAllOption.value)) {

                                config.selectedPlacesIds = [];
                                setConfig({...config});
                            }

                            // Uma categoria foi deselecionada, logo, todos locais dessa categoria também devem ser deselecionados
                            else if (actionMeta.action === 'deselect-option' || actionMeta.action === 'remove-value') {
                                const currentOpt = removed || opt
                                config.selectedPlacesIds = config.selectedPlacesIds.filter((id) => {
                                    const place = places.find((place) => place.id === id) as Place
                                    return !place.categoriesIds.includes(currentOpt.value as number)
                                });
                                setConfig({...config});
                            }

                            // Uma categoria foi selecionada, logo, todos locais dessa categoria também devem ser selecionados
                            else if (actionMeta.action === 'select-option') {
                                config.selectedPlacesIds = [...config.selectedPlacesIds, ...places.filter((place) => place.categoriesIds.includes(opt.value as number)).map((place) => place.id)];
                                setConfig({...config});
                            }

                        }}
                        disabled={disabled}
                    />
                </header>
                <div className="max-h-[470px] overflow-y-auto p-4">
                    {placesGrid(
                        places.filter((place) => config.selectedPlacesIds.includes(place.id)),
                        (place) => {
                            config.selectedPlacesIds = config.selectedPlacesIds.filter((id) => id !== place.id);
                            setConfig({...config});
                        }
                    )}
                </div>
            </section>

            <BsArrowDownUp className='mx-auto mt-4 block text-zinc-400' size={40} aria-hidden="true" />

            <section className="mt-4 overflow-hidden rounded-xl border border-zinc-200">
                <header className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-center">
                    <h4 className="text-base font-semibold">{t('config.unselectedPlaces', { count: places.length - config.selectedPlacesIds.length })}</h4>
                </header>
                <div className="max-h-[470px] overflow-y-auto p-4">
                    {placesGrid(
                        places.filter((place) => !config.selectedPlacesIds.includes(place.id)),
                        (place) => {
                            config.selectedPlacesIds = [...config.selectedPlacesIds, place.id]
                            setConfig({...config})
                        }
                    )}
                </div>
            </section>
        </>
    );
}
