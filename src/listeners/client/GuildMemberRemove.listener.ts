import { AstraniumClient } from "../../lib/Client";
import { Constants } from "../../constants";
import { GuildMember, VoiceChannel } from "discord.js";
import { Listener } from "../../lib/Listener";

export default class GuildMemberRemoveListener extends Listener {
    public constructor() {
        super("guildMemberRemove", {
            category: "client",
            emitter: "client",
            once: false
        });
    }

    public async exec(
        client: AstraniumClient,
        member: GuildMember
    ): Promise<void> {
        if (member.partial) await member.fetch();

        const allMembers: VoiceChannel = (await member.guild.channels.fetch(
            Constants.Channels["all_members"]
        )) as VoiceChannel;
        const members: VoiceChannel = (await member.guild.channels.fetch(
            Constants.Channels["members"]
        )) as VoiceChannel;
        const bots: VoiceChannel = (await member.guild.channels.fetch(
            Constants.Channels["bots"]
        )) as VoiceChannel;

        allMembers.setName(
            allMembers.name.replace(/\d+/, member.guild.memberCount.toString())
        );

        if (member.user.bot) {
            bots.setName(
                bots.name.replace(
                    /\d+/,
                    member.guild.members.cache
                        .filter((m: GuildMember): boolean => m.user.bot)
                        .size.toString()
                )
            );
        } else {
            members.setName(
                members.name.replace(
                    /\d+/,
                    member.guild.members.cache
                        .filter((m: GuildMember): boolean => !m.user.bot)
                        .size.toString()
                )
            );
        }

        (await member.guild.members.fetch())
            .filter((member: GuildMember): boolean => !member.user.bot)
            .forEach(
                async (member: GuildMember): Promise<void> =>
                    await client.util.createMember(client, member.id)
            );
    }
}
