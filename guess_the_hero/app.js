import md5 from 'md5'
import ora from 'ora';
import inquirer from 'inquirer';
import asciify from 'asciify-image'
import chalk from 'chalk';
import heroIds from './heroes.js';
import figlet from 'figlet';
import boxen from 'boxen';

const ts = Date.now();
const privateKey = '1925395a2bec70e155ca7cd4a0e0f8e49d38e258';
const publicKey = 'e4c68aea033b59db16765e8a9f75bf16';

const hash = md5(ts + privateKey + publicKey);

async function heroData(hero) {
    const url = `http://gateway.marvel.com/v1/public/characters/${hero.id}?ts=${ts}&apikey=${publicKey}&hash=${hash}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

async function displayHeroImage(url) {
    const options = {
        fit: 'box',
        width: 100,
        height: 60
    };
    try {
        const asciified = await asciify(url, options);
        console.log(boxen(asciified, { padding: 1, borderStyle: 'classic', borderColor: 'red' }));
    } catch (error) {
        console.error(chalk.red('Erro ao gerar ASCII art:', error));
    }
}

async function startGame() {

    figlet('Adivinhe o Herói', (err, data) => {
        if (err) {
            console.log('Algo deu errado...');
            console.dir(err);
            return;
        } else {
            console.log(chalk.cyan(data));
        }
    });

    const spinner = ora(chalk.yellow('Carregando dados do herói...')).start();

    try {

        const randomHero = heroIds[Math.floor(Math.random() * heroIds.length)];


        const data = await heroData(randomHero);
        let heroDescription = data.data.results[0].description;

        const personalNames = ['Natasha', 'Romanoff', 'Tony', 'Stark', 'Steve', 'Rogers', 'Matt', 'Murdock', 'Sam', 'Wilson', 'Bruce', 'Banner', 'Gwen', 'Stacy', 'Peter', 'Parker', 'Miles', 'Morales', 'Danny', 'Rand', 'Kamala Khan', 'Red', 'Thunderbolt', 'Ross', 'Jennifer', 'Walters', 'Quill', 'Ultron', 'Hawkeye', 'Star', 'Lord', 'Ms', 'Marvel'];

        const heroName = data.data.results[0].name;

        // Substitui o nome do herói na descrição por asteriscos
        if (heroDescription) {
            heroDescription = heroDescription.replaceAll(heroName.name, '******');

            personalNames.forEach(name => {
                heroDescription = heroDescription.replaceAll(name, '******');
            });

            heroDescription = heroDescription.replaceAll(randomHero.name, '******');
        }

        const heroImageUrl = data.data.results[0].thumbnail.path + '.' + data.data.results[0].thumbnail.extension;

        spinner.succeed(chalk.green('Dados carregados com sucesso!'));

        console.log(chalk.yellow('\nDescrição do herói:'));
        const boxedDescription = boxen(chalk.white(heroDescription), { padding: 1, borderStyle: 'double' });
        console.log(boxedDescription);

        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
            const { guess } = await inquirer.prompt({
                name: 'guess',
                type: 'input',
                message: `Quem é o herói? Tentativa ${attempts + 1} de ${maxAttempts}:`
            });

            if (guess.toLowerCase() === randomHero.name.toLowerCase()) {
                console.log(chalk.green('Parabéns! Você acertou!'));
                figlet(randomHero.name, (err, data) => {
                    if (err) {
                        console.log('Algo deu errado...');
                        console.dir(err);
                        return;
                    } else {
                        console.log(boxen(chalk.yellow(data), { title: 'HERO', titleAlignment: 'center', borderStyle: 'double', borderColor: 'red', padding: 1 }));
                    }
                });
                await displayHeroImage(heroImageUrl);
                return;
            } else if (attempts < maxAttempts - 1) {
                console.log(chalk.red('Resposta incorreta. Tente novamente.'));
            } else {
                console.log(chalk.red('Resposta incorreta.'));
            }

            attempts++;
        }

        console.log(chalk.red(`Você usou todas as tentativas. O herói era:`));

        figlet(randomHero.name, (err, data) => {
            if (err) {
                console.log('Algo deu errado...');
                console.dir(err);
                return;
            } else {
                console.log(boxen(chalk.yellow(data), { title: 'HERO', titleAlignment: 'center', borderStyle: 'double', borderColor: 'red', padding: 1 }));
            }
        });

        await displayHeroImage(heroImageUrl);

    } catch (error) {
        spinner.fail(chalk.red('Erro ao carregar os dados.'));
        console.error(error);
    }
}

startGame();