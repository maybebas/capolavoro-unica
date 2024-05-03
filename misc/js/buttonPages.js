const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { parse } = require('dotenv');
const emoji = require('./emoji.js');

async function buttonPages(interaction, pages, time = 60000) {
    //errors
    if (!interaction) throw new TypeError('Missing argument: interaction');
    if (!pages) throw new TypeError('Missing argument: pages');
    if (!Array.isArray(pages)) throw new TypeError('Pages must be an array');
    if (pages.length < 2) throw new RangeError('Pages array must have at least 2 items');

    if (typeof time !== 'number') throw new TypeError('Time must be a number');
    if (parseInt(time) < 30000) throw new RangeError('Time must be greater than 30000 (30 seconds)');

    //defer reply
    // await interaction.deferReply();

    // adding buttons
    const first = new ButtonBuilder()
    .setCustomId('first')
    .setEmoji(emoji.first)
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true)

    const prev = new ButtonBuilder()
    .setCustomId('prev')
    .setEmoji(emoji.left)
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true)

    const next = new ButtonBuilder()
    .setCustomId('next')
    .setEmoji(emoji.right)
    .setStyle(ButtonStyle.Primary)
    .setDisabled(false)

    const last = new ButtonBuilder()
    .setCustomId('last')
    .setEmoji(emoji.last)
    .setStyle(ButtonStyle.Primary)
    .setDisabled(false)

    const row = new ActionRowBuilder()
    .addComponents(first, prev, next, last)

    let index = 0

    const currentPage = await interaction.editReply({
        embeds: [pages[index]],
        components: [row],
        fetchReply: true,
    })

    // creating collector
    const collector = await currentPage.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time,
    })

    collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id) {
            return i.reply({
                content:"Non puoi usare questo pulsante!",
                ephemeral: true,
            })
        }

        await i.deferUpdate();

        if (i.customId === 'prev') {
            if (index > 0) index--;
        }

        if (i.customId === 'next') {
            if (index < pages.length - 1) index++;
        }

        if (i.customId === 'first') index = 0;
        if (i.customId === 'last') index = pages.length - 1;

        if (index === 0) {
            prev.setDisabled(true)
            first.setDisabled(true)
        } else {
            prev.setDisabled(false)
            first.setDisabled(false)
        }

        if (index === pages.length - 1) {
            next.setDisabled(true)
            last.setDisabled(true)
        } else {
            next.setDisabled(false)
            last.setDisabled(false)
        }

        await currentPage.edit({
            embeds: [pages[index]],
            components: [row],
        })

        collector.resetTimer()
    })

    // ending collector
    collector.on("end", async () => {
        await currentPage.edit({
            embeds: [pages[index]],
            components: [ ],
        })
    })
    return currentPage;
    
}

module.exports = buttonPages;