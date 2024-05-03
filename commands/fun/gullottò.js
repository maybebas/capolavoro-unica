const { AttachmentBuilder, SlashCommandBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gullottò")
        .setDescription("non farlo..."),

    execute: async (interaction) => {
        await interaction.deferReply();

        try {
            const file = new AttachmentBuilder("misc/images/gullottò.jpg")
            return interaction.followUp({ files: [ file ]})
        } catch (e) {
            console.log(e)
            return interaction.followUp(`Qualcosa è andato storto: ${e}`);
        }
        

    }
}