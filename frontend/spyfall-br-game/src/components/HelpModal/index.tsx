import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';

interface HelpModalProps {
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}

export default function HelpModal({show, setShow}: HelpModalProps) {

    const handleClose = () => setShow(false);

    return (
        <Modal onHide={handleClose} show={show} >
            <Modal.Header closeButton>
                Como jogar
            </Modal.Header>
            <Modal.Body >
                <h2 className='h3'>
                    Tutorial em vídeo
                </h2>
                <p>
                    Caso prefira, existe <a href='https://youtu.be/OdbCMcpCR4c?si=jx8pOGtwF-S0b2Zg'>um tutorial em vídeo muito bom no YouTube, feito pelo canal Covil dos Jogos</a>
                </p>


                <h2 className='h3'>
                    Contexto
                </h2>
                <p>
                    Você é um detetive e está em uma festa com outras pessoas. Porém, um dos presentes é um espião que não sabe onde está.
                </p>

                <h2 className='h3'>
                    Recomendações para jogatina
                </h2>
                <ul>
                    <li>
                        3 a 8 pessoas
                    </li>
                    <li>
                        Todos podendo se comunicar um com os outros, sendo presencialmente ou não
                    </li>
                    <li>
                        Um dispositivo para cada jogador
                    </li>
                </ul>

                <h2 className='h3'>
                    Como jogar
                </h2>

                <p>
                    Será sorteado uma pessoa para ser o <strong>espião</strong> e todos outros serão os <strong>detetives (não espiões)</strong>. Também será sorteado um <strong>lugar</strong> para onde todos estão indo. O espião não sabe onde está, mas os detetives sim. Os objetivos de cada um são:
                    <ul>
                        <li>
                            <strong>Espião</strong>: descobrir onde está, acabar com o tempo e não ser descoberto ou fazer com que outro detetive seja acusado como espião
                        </li>
                        <li>
                            <strong>Detetives</strong>: descobrir quem é o espião
                        </li>
                    </ul>
                </p>

                <h2 className='h3'>
                    Rodadas
                </h2>
                <p>
                    No início de cada rodada, todos os jogadores, exceto o espião, recebem uma <strong>profissão</strong> e um <strong>lugar</strong>. A profissão é o que o jogador faz no lugar sorteado, podendo ser usada para fazer "atuações" daquela profissão. A atuação pela profissão é opcional, mas sempre serão sorteadas. No começo da rodada, um jogador será escolhido como questionador, tendo que escolher um dos outros jogadores para fazer <strong>uma pergunta</strong> a respeito do lugar. O perguntado deve responder a pergunta, buscando não dar muitos detalhes (para não dar muita informação para o espião), mas o suficiente para remover suspeitas dos outros detetives. O espião, quando perguntando ou perguntar, deve blefar, podendo soar suspeito. Existem três formas de acabar a rodada:
                    <ul>
                        <li>
                            <strong>Votação unanime</strong>: a qualquer momento na partida, um jogador pode acusar outro jogador, abrindo uma votação. Para a votação ser aprovada, todos os jogadores devem concordar com ela. Caso pelo menos um dos jogadores recuse a votação, ela será encerrada e a rodada continuará normalmente. O acusado não tem poder de voto em sua acusação. Caso a votação seja aceita e o espião tenha sido o acusado, todos os detetives ganham pontos, sendo que o acusador ganha pontos extras. Caso o acusado seja um detetive, o espião ganha.
                        </li>
                        <li>
                            <strong>Adivinhação do local</strong>: a qualquer momento da partida o espião pode tentar adivinhar o local. Se o espião adivinhar o local corretamente, ele ganha, caso contrário, todos os detetives ganham.
                        </li>
                        <li>
                            <strong>Tempo acabou</strong>: no começo da rodada, um cronômetro será iniciado. Caso o tempo acabe, o espião ganha
                        </li>
                    </ul>
                </p>
            </Modal.Body>
        </Modal>
    )
}