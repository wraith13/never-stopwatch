import { minamo } from "../../nephila/minamo.js/index.js";
import { Locale } from "./tektite-locale";
import { Fullscreen as FullscreenModule } from "./tektite-fullscreen";
import { Screen } from "./tektite-screen";
import { Toast as ToastModule } from "./tektite-toast";
import { Header } from "./tektite-header";
import { Menu } from "./tektite-menu";
import { Key as KeyModule } from "./tektite-key";
import tektiteResource from "../images.json";
export module Tektite
{
    export const $make = minamo.dom.make;
    export const $tag = minamo.dom.tag;
    export const $div = $tag("div");
    export const $span = $tag("span");
    export const $labelSpan = $span("label");
    export const monospace = (classNameOrValue: string | minamo.dom.Source, labelOrValue?: minamo.dom.Source, valueOrNothing?: minamo.dom.Source) =>
        "string" !== typeof classNameOrValue || undefined === labelOrValue ?
            $span("value monospace")(classNameOrValue):
            $div(classNameOrValue)
            ([
                undefined !== valueOrNothing ? labelOrValue: [],
                $span("value monospace")(valueOrNothing ?? labelOrValue),
            ]);
    export interface LocaleEntry
    {
        [key : string] : string;
    }
    export const progressBarStyleObject =
    {
        "header": null,
        "auto": null,
        "horizontal": null,
        "vertical": null,
    };
    export type ProgressBarStyleType = keyof typeof progressBarStyleObject;
    export const ProgressBarStyleList = Object.keys(progressBarStyleObject);
    export type HeaderSegmentSource<PageParams, IconKeyType> = Header.SegmentSource<PageParams, IconKeyType>;
    export type HeaderSource<PageParams, IconKeyType> = Header.Source<PageParams, IconKeyType>;
    export type PrimaryPageSource = { body: minamo.dom.Source, footer?: minamo.dom.Source, };
    export type PageSource = { primary: PrimaryPageSource | minamo.dom.Source, trail?: minamo.dom.Source, };
    export interface ScreenSource<PageParams, IconKeyType>
    {
        className?: string;
        header: HeaderSource<PageParams, IconKeyType>;
        body: PageSource | minamo.dom.Source;
    }
    export type TektiteIconKeyType = keyof typeof tektiteResource;
    export type UpdateScreenEventEype = "high-resolution-timer" | "timer" | "scroll" | "storage" | "focus" | "blur" | "operate";
    export interface TektiteParams<PageParams, IconKeyType, LocaleEntryType extends LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        makeUrl: (args: PageParams) => string;
        showUrl: (data: PageParams) => Promise<unknown>;
        showPage: (url: string) => Promise<unknown>;
        loadSvgOrCache: (key: IconKeyType | TektiteIconKeyType) => Promise<SVGElement>;
        localeMaster: LocaleMapType;
        timer?: { resolution?: number, highResolution?: number, };
    }
    export class Tektite<PageParams, IconKeyType, LocaleEntryType extends LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        constructor(public params: TektiteParams<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        {
            window.addEventListener("compositionstart", this.key.onCompositionStart);
            window.addEventListener("compositionend", this.key.onCompositionEnd);
        }
        public loadSvgOrCache = (key: TektiteIconKeyType) => this.params.loadSvgOrCache(key);
        public fullscreen = FullscreenModule;
        public key = KeyModule;
        public screen = Screen.make(this);
        public menu = Menu.make(this);
        public locale = Locale.make(this);
        public toast = ToastModule;
        public internalLink = (data: { className?: string, href: PageParams, children: minamo.dom.Source}): minamo.dom.Source =>
        ({
            tag: "a",
            className: data.className,
            href: this.params.makeUrl(data.href),
            children: data.children,
            onclick: (_event: MouseEvent) =>
            {
                // event.stopPropagation();
                this.params.showUrl(data.href);
                return false;
            }
        });
        public externalLink = (data: { className?: string, href: string, children: minamo.dom.Source}) =>
        ({
            tag: "a",
            className: data.className,
            href: data.href,
            children: data.children,
        });
        public onWebkitFullscreenChange = (_event: Event) =>
        {
            if (0 <= navigator.userAgent.indexOf("iPad") || (0 <= navigator.userAgent.indexOf("Macintosh") && "ontouchend" in document))
            {
                document.body.classList.toggle("tektite-fxxking-ipad-fullscreen", this.fullscreen.element());
            }
        };
        public reload = async () => await this.params.showPage(location.href);
        public setTitle = (title: string) =>
        {
            if (document.title !== title)
            {
                document.title = title;
            }
        };
        public escape = () =>
        {
            const target = this.screen.getScreenCover() ?? this.screen.header.getCloseButton();
            target?.click();
            return !! target;
        }
        //  Window > Foundation > Screen
        public setWindowColor = (color: string) =>
        {
            minamo.dom.setStyleProperty(document.body, "backgroundColor", `${color}E8`);
            minamo.dom.setProperty("#tektite-theme-color", "content", color);
        };
        public setFoundationColor = (color: string | null) =>
                minamo.dom.setStyleProperty("#tektite-foundation", "backgroundColor", color ?? "");
        latestColor: string | null;
        public setBackgroundColor = (color: string | null) =>
        {
            this.latestColor = color;
            if (document.body.classList.contains("tektite-style-classic"))
            {
                this.screen.header.setColor(color);
                this.setFoundationColor(null);
            }
            if (document.body.classList.contains("tektite-style-modern"))
            {
                this.setFoundationColor(color);
                this.screen.header.setColor(null);
            }
        };
        public setStyle = (style: "modern" | "classic") =>
        {
            if
            (
                [
                    { className: "tektite-style-modern", tottle: "modern" === style, },
                    { className: "tektite-style-classic", tottle: "classic" === style, },
                ]
                .map(i => minamo.dom.toggleCSSClass(document.body, i.className, i.tottle).isUpdate)
                .reduce((a, b) => a || b, false)
            )
            {
                this.setBackgroundColor(this.latestColor ?? null);
            }
        }
        public setProgressBarStyle = (progressBarStyle: Tektite.ProgressBarStyleType) =>
            this.setStyle("header" !== progressBarStyle ? "modern": "classic");
        public getScreenBarElement = () => document.getElementsByClassName("tektite-screen-bar")[0] as HTMLDivElement;
        public resetScreenBarProgress = () =>
        {
            const screenBar = this.getScreenBarElement();
            minamo.dom.setStyleProperty(screenBar, "display", "none");
        }
        public resetProgress = () =>
        {
            this.resetScreenBarProgress();
            this.screen.header.resetProgress();
        }
        public setProgress = (progressBarStyle: Tektite.ProgressBarStyleType, percent: null | number, color?: string) =>
        {
            this.setProgressBarStyle(progressBarStyle);
            if (null !== percent && "header" !== progressBarStyle)
            {
                const screenBar = this.getScreenBarElement();
                if (color)
                {
                    minamo.dom.setStyleProperty(screenBar, "backgroundColor", color);
                }
                const percentString = makePercentString(percent);
                if ((window.innerHeight < window.innerWidth && "vertical" !== progressBarStyle) || "horizontal" === progressBarStyle)
                {
                    minamo.dom.addCSSClass(screenBar, "horizontal");
                    minamo.dom.removeCSSClass(screenBar, "vertical");
                    minamo.dom.setStyleProperty(screenBar, "height", "initial");
                    minamo.dom.setStyleProperty(screenBar, "maxHeight", "initial");
                    minamo.dom.setStyleProperty(screenBar, "width", percentString);
                    minamo.dom.setStyleProperty(screenBar, "maxWidth", percentString);
                }
                else
                {
                    minamo.dom.addCSSClass(screenBar, "vertical");
                    minamo.dom.removeCSSClass(screenBar, "horizontal");
                    minamo.dom.setStyleProperty(screenBar, "width", "initial");
                    minamo.dom.setStyleProperty(screenBar, "maxWidth", "initial");
                    minamo.dom.setStyleProperty(screenBar, "height", percentString);
                    minamo.dom.setStyleProperty(screenBar, "maxHeight", percentString);
                }
                minamo.dom.setStyleProperty(screenBar, "display", "block");
            }
            else
            {
                this.resetScreenBarProgress();
            }
            if (null !== percent && "header" === progressBarStyle)
            {
                this.screen.header.setProgress(percent, color);
            }
            else
            {
                this.screen.header.resetProgress();
            }
            // minamo.dom.toggleCSSClass(this.header.getElement(), "with-screen-prgress", null !== percent);
        };
        public flash = () =>
        {
            document.body.classList.add("tektite-flash");
            setTimeout(() => document.body.classList.remove("tektite-flash"), 1500);
        };
        private updateTimer = undefined;
        private updateHighResolutionTimer = undefined;
        onWindowFocus = () =>
        {
            this.screen.update?.("focus");
        };
        onWindowBlur = () =>
        {
            this.screen.update?.("blur");
        };
        private onUpdateStorageCount = 0;
        onUpdateStorage = () =>
        {
            const onUpdateStorageCountCopy = this.onUpdateStorageCount = this.onUpdateStorageCount +1;
            setTimeout
            (
                () =>
                {
                    if (onUpdateStorageCountCopy === this.onUpdateStorageCount)
                    {
                        this.screen.update?.("storage");
                    }
                },
                50,
            );
        };
        public onLoad = () =>
        {
            minamo.dom.make
            ({
                parent: document.body,
                tag: "div",
                id: "tektite-foundation",
                children:
                {
                    tag: "div",
                    id: "tektite-screen",
                    className: "tektite-screen",
                    children:
                    [
                        Header.domSource,
                        {
                            tag: "div",
                            id: "tektite-screen-body",
                            className: "tektite-screen-body",
                        },
                        {
                            tag: "div",
                            className: "tektite-screen-bar",
                            childNodes:
                            {
                                tag: "div",
                                className: "tektite-screen-bar-flash-layer",
                            },
                        },
                        {
                            tag: "div",
                            id: "tektite-screen-toast",
                        },
                    ]
                }
            });
            window.addEventListener("focus", this.onWindowFocus);
            window.addEventListener("blur", this.onWindowBlur);
            window.addEventListener("storage", this.onUpdateStorage);
            this.screen.header.onLoad(this.screen);
            document.getElementById("tektite-screen-body").addEventListener
            (
                "scroll",
                () =>
                {
                    this.screen.adjustPageFooterPosition();
                    this.screen.adjustDownPageLinkDirection();
                    if (document.getElementById("tektite-screen-body").scrollTop <= 0)
                    {
                        this.screen.update?.("scroll");
                    }
                }
            );
            if (undefined === this.updateTimer)
            {
                this.updateTimer = setInterval
                (
                    () => this.screen.update?.("timer"),
                    360
                );
            }
            if (undefined === this.updateHighResolutionTimer)
            {
                this.updateHighResolutionTimer = setInterval
                (
                    () => this.screen.update?.("high-resolution-timer"),
                    36
                );
            }
        };
    }
    export const make = <PageParams, IconKeyType, LocaleEntryType extends LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(params: TektiteParams<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new Tektite(params);
    export const makePercentString = (percent: number) =>
        percent.toLocaleString("en", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, });
}
