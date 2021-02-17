import {
	CancellationToken,
	commands,
	Disposable,
	env,
	EventEmitter,
	ExtensionContext,
	ThemeIcon,
	Timeline,
	TimelineChangeEvent,
	TimelineItem,
	TimelineOptions,
	TimelineProvider,
	Uri,
	workspace,
} from 'vscode';
import Twitter from 'twitter';

export function activate(context: ExtensionContext): void {
	context.subscriptions.push(new TwitterTimeline());
}

export function deactivate(): void {}

interface Tweet {
	text: string;
	created_at: string;
	id: number;
	id_str: string;

	urls: {
		url: string;
		expanded_url: string;
	}[];
	user: {
		name: string;
		screen_name: string;
	};

	[key: string]: any;
}

class TwitterTimelineItem extends TimelineItem {
	readonly username: string;

	constructor(tweet: Tweet) {
		const index = tweet.text.indexOf('\n');
		const label = index >= 0 ? `${tweet.text.substring(0, index)}...` : tweet.text;

		super(label, new Date(tweet.created_at).getTime());

		this.id = tweet.id_str;
		this.username = tweet.user.screen_name;

		this.description = `${tweet.user.name} \u2022 @${this.username}`;
		this.detail = tweet.text;
		this.iconPath = new ThemeIcon('twitter');
		this.command = {
			command: 'twitterTimeline.openItem',
			title: '',
			arguments: [this],
		};
	}

	get uri() {
		return Uri.parse(`https://twitter.com/${this.username}/status/${this.id!}`);
	}
}

class TwitterTimeline implements TimelineProvider, Disposable {
	readonly id = 'twitter';
	readonly label = 'Twitter Timeline';

	private _onDidChange = new EventEmitter<TimelineChangeEvent | undefined>();
	readonly onDidChange = this._onDidChange.event;

	private disposable: Disposable;

	constructor() {
		const handle = setInterval(
			() => this._onDidChange.fire(this.lastUri ? { uri: this.lastUri, reset: false } : undefined),
			30000,
		);
		this.disposable = Disposable.from(
			workspace.registerTimelineProvider('*', this),
			commands.registerCommand('twitterTimeline.openItem', (item: TwitterTimelineItem) => this.open(item)),
			{
				dispose: () => clearInterval(handle),
			},
		);
	}

	dispose() {
		this.disposable.dispose();
	}

	private _client: Twitter | undefined;
	get client() {
		if (this._client === undefined) {
			this._client = new Twitter({
				consumer_key: process.env.TWITTER_CONSUMER_KEY!,
				consumer_secret: process.env.TWITTER_CONSUMER_SECRET!,
				access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY!,
				access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
			});
		}
		return this._client;
	}

	private lastUri: Uri | undefined;

	async provideTimeline(
		uri: Uri,
		options: TimelineOptions,
		_token: CancellationToken,
	): Promise<Timeline | undefined> {
		this.lastUri = uri;

		try {
			const tweets = (await this.client.get('statuses/home_timeline.json', {
				count: typeof options.limit === 'number' ? options.limit : undefined,
				since_id: typeof options.limit === 'object' ? options.limit.id : undefined,
				max_id: options.cursor,
				exclude_replies: true,
			})) as Tweet[];

			const items = tweets.map(tweet => new TwitterTimelineItem(tweet));

			// If we are fetching more recent items, don't return paging info
			if (options.cursor === undefined && typeof options.limit === 'object') {
				return {
					items: items,
					// paging: { cursor: items[items.length - 1]?.id },
				};
			}

			return {
				items: items,
				paging: items.length ? { cursor: items[items.length - 1].id } : undefined,
			};
		} catch (ex) {
			console.log(ex);

			try {
				const rateLimitStatus = await this.client.get('application/rate_limit_status.json', {
					resources: 'statuses',
				});
				console.log(rateLimitStatus?.resources?.statuses?.['/statuses/home_timeline']);
			} catch {}

			return undefined;
		}
	}

	open(item: TwitterTimelineItem) {
		return env.openExternal(item.uri);
	}
}
