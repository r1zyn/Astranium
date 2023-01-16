import { AstraniumClient } from "../../lib/Client";
import { Constants } from "../../constants";
import { GuildMember, VoiceChannel } from "discord.js";
import { Listener } from "../../lib/Listener";

export default class GuildMemberUpdateListener extends Listener {
    public constructor() {
        super("guildMemberUpdate", {
            category: "client",
            emitter: "client",
            once: false
        });
    }

    public async exec(
        _client: AstraniumClient,
        oldMember: GuildMember,
        newMember: GuildMember
    ): Promise<void> {
        if (oldMember.partial) await oldMember.fetch();
        if (newMember.partial) await newMember.fetch();

        const boosters: VoiceChannel = (await newMember.guild.channels.fetch(
            Constants.Channels["boosters"]
        )) as VoiceChannel;

        if (oldMember.premiumSince !== newMember.premiumSince) {
            boosters.setName(
                boosters.name.replace(
                    /\d+/,
                    newMember.guild.premiumTier.toString()
                )
            );
        }
    }
}
