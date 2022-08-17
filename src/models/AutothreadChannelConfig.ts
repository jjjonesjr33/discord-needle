import { Nullish } from "../helpers/typeHelpers";
import ReplyType from "./enums/ReplyType";
import TitleType from "./enums/TitleFormat";
import ToggleOption from "./enums/ToggleOption";

export default class AutothreadChannelConfig {
	public readonly channelId: string;
	public readonly archiveImmediately: ToggleOption;
	public readonly replyType: ReplyType;
	public readonly customReply: string;
	public readonly includeBots: ToggleOption;
	public readonly slowmode: number;
	public readonly statusReactions: ToggleOption;
	public readonly titleType: TitleType;
	public readonly customTitle: string;

	constructor(
		oldConfig: Nullish<AutothreadChannelConfig>,
		channelId: string,
		archiveImmediately: Nullish<ToggleOption>,
		includeBots: Nullish<ToggleOption>,
		slowmode: Nullish<number>,
		statusReactions: Nullish<ToggleOption>,
		replyType: Nullish<ReplyType>,
		customReply: Nullish<string>,
		titleType: Nullish<TitleType>,
		customTitle: Nullish<string>
	) {
		this.channelId = channelId;
		this.archiveImmediately = archiveImmediately ?? oldConfig?.archiveImmediately ?? ToggleOption.On;
		this.includeBots = includeBots ?? oldConfig?.includeBots ?? ToggleOption.Off;
		this.slowmode = slowmode ?? oldConfig?.slowmode ?? 0;
		this.statusReactions = statusReactions ?? oldConfig?.statusReactions ?? ToggleOption.Off;

		this.replyType = replyType ?? oldConfig?.replyType ?? ReplyType.DefaultWithButtons;
		this.customReply = this.getCustomReply(oldConfig, customReply);

		this.titleType = titleType ?? oldConfig?.titleType ?? TitleType.FirstFourtyChars;
		this.customTitle = this.getCustomTitle(oldConfig, customTitle);
	}

	private getCustomReply(oldConfig: Nullish<AutothreadChannelConfig>, incomingCustomReply: Nullish<string>): string {
		const switchingAwayFromCustom =
			oldConfig?.replyType !== this.replyType &&
			(oldConfig?.replyType === ReplyType.CustomWithButtons ||
				oldConfig?.replyType === ReplyType.CustomWithoutButtons);

		return switchingAwayFromCustom ? "" : incomingCustomReply ?? oldConfig?.customReply ?? "";
	}

	private getCustomTitle(oldConfig: Nullish<AutothreadChannelConfig>, incomingCustomTitle: Nullish<string>): string {
		if (this.titleType === TitleType.Custom) return incomingCustomTitle ?? oldConfig?.customTitle ?? "";
		if (oldConfig?.titleType === TitleType.Custom) return ""; // Reset if switching away from custom
		return this.getDefaultRegex(this.titleType);
	}

	private getDefaultRegex(titleType: TitleType): string {
		switch (titleType) {
			case TitleType.FirstLineOfMessage:
				return "/.*/";
			case TitleType.FirstFourtyChars:
				return "/^((.|\\s){0,40})/ig";
			case TitleType.NicknameDate:
				return "$USER ($DATE)";

			default:
			case TitleType.DiscordDefault:
			case TitleType.Custom:
				return "";
		}
	}
}
