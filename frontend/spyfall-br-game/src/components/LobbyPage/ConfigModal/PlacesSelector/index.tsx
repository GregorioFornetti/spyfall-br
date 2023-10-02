import { useEffect, useState } from "react";

import { Container, Card, Row } from "react-bootstrap";
import MultiSelect, { Option } from "../../../Multiselect";
import Category from '../../../../interfaces/CategoryInterface';
import Place from '../../../../interfaces/PlaceInterface';
import Config from '../../../../interfaces/ConfigInterface';
import PlaceCard from '../../../PlaceCard';
import { BsArrowDownUp } from "react-icons/bs";

interface PlaceSelectorProps {
    categories: Category[],
    config: Config,
    setConfig: React.Dispatch<React.SetStateAction<Config>>,
    places: Place[],
    disabled?: boolean
}

export default function PlaceSelector({categories, config, places, setConfig, disabled}: PlaceSelectorProps) {

    const options = categories.map((category) => ({value: category.id, label: category.name}))
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

    return (
        <>
            <Container className='mt-4'>
                <Card>
                    <Card.Header className={'text-center'}>
                        <h3 className="h5">Lugares selecionados</h3>
                        <MultiSelect
                            options={options}
                            selected={selectedCategories}
                            setSelected={setSelectedCategories}
                            title='Selecionar por categorias'
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
                    </Card.Header>
                    <Card.Body style={{height: '470px', overflowY: 'scroll'}}>
                        <Container>
                            <Row xl={3} lg={2} sm={1} className="gy-4">
                                {places
                                .filter((place) => config.selectedPlacesIds.includes(place.id))
                                .map((place) => (
                                    <PlaceCard
                                        type={disabled ? 'selected' : 'option'}
                                        title={place.name}
                                        key={place.id}
                                        imgURL={place.imgPath}
                                        onClick={disabled ? undefined : () => {
                                            config.selectedPlacesIds = config.selectedPlacesIds.filter((id) => id !== place.id);
                                            setConfig({...config});
                                        }}
                                    />
                                ))}
                            </Row>
                        </Container>
                    </Card.Body>
                </Card>
            </Container>
            
            <BsArrowDownUp className='d-block mx-auto mt-4' size={50} />

            <Container className='mt-4'>
                <Card>
                    <Card.Header className={'text-center'}>
                        <h3 className="h5">Lugares não selecionados</h3>
                    </Card.Header>
                    <Card.Body style={{height: '470px', overflowY: 'scroll'}}>
                        <Container>
                            <Row xl={3} lg={2} sm={1} className="gy-4">
                                {places
                                .filter((place) => !config.selectedPlacesIds.includes(place.id))
                                .map((place) => (
                                    <PlaceCard
                                        type={disabled ? 'selected' : 'option'}
                                        title={place.name}
                                        key={place.id}
                                        imgURL={place.imgPath}
                                        onClick={disabled ? undefined : () => {
                                            config.selectedPlacesIds = [...config.selectedPlacesIds, place.id]
                                            setConfig({...config})
                                        }}
                                    />
                                ))}
                            </Row>
                        </Container>
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
}