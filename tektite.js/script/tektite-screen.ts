import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
import { Header } from "./tektite-header";
export module Screen
{
    const $make = minamo.dom.make;
    export class Screen<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        {
        }
        public header = Header.make(this.tektite);
        getElement = () => document.getElementById("tektite-screen") as HTMLDivElement;
        update: (event: Tektite.UpdateScreenEventEype) => unknown;
        public cover = (data: { children?: minamo.dom.Source, onclick: () => unknown, }) =>
        {
            const onclick = async () =>
            {
                if (dom === (this.lastMouseDownTarget ?? dom))
                {
                    console.log("tektite-screen-cover.click!");
                    dom.onclick = undefined;
                    data.onclick();
                    close();
                }
            };
            const dom = $make(HTMLDivElement)
            ({
                tag: "div",
                className: "tektite-screen-cover tektite-fade-in",
                children: data.children,
                onclick,
            });
            // dom.addEventListener("mousedown", onclick);
            const close = async () =>
            {
                dom.classList.remove("tektite-fade-in");
                dom.classList.add("tektite-fade-out");
                await minamo.core.timeout(500);
                minamo.dom.remove(dom);
            };
            minamo.dom.appendChildren(this.getElement(), dom);
            const result =
            {
                dom,
                close,
            };
            return result;
        };
        public getScreenCoverList = () => minamo.dom.getDivsByClassName(document, "tektite-screen-cover");
        public getScreenCover = () => this.getScreenCoverList().filter((_i, ix, list) => (ix +1) === list.length)[0];
        public hasScreenCover = () => 0 < this.getScreenCoverList().length;
        // public popup =
        // (
        //     data:
        //     {
        //         className?: string,
        //         children: minamo.dom.Source,
        //         onClose?: () => Promise<unknown>
        //     }
        // ) =>
        // {
        //     const dom = $make(HTMLDivElement)
        //     ({
        //         tag: "div",
        //         className: `tektite-popup tektite-locale-parallel-off ${data.className ?? ""}`,
        //         children: data.children,
        //         onclick: async (event: MouseEvent) =>
        //         {
        //             console.log("popup.click!");
        //             event.stopPropagation();
        //             //getScreenCoverList.forEach(i => i.click());
        //         },
        //     });
        //     const close = async () =>
        //     {
        //         await data.onClose?.();
        //         screenCover.close();
        //     };
        //     // minamo.dom.appendChildren(document.body, dom);
        //     const screenCover = this.cover
        //     ({
        //         children:
        //         [
        //             dom,
        //             { tag: "div", }, // レイアウト調整用のダミー要素 ( この調整がないとポップアップが小さく且つ入力要素がある場合に iPad でキーボードの下に dom が隠れてしまう。 )
        //         ],
        //         onclick: async () =>
        //         {
        //             await data.onClose?.();
        //             //minamo.dom.remove(dom);
        //         },
        //     });
        //     const result =
        //     {
        //         dom,
        //         close,
        //     };
        //     return result;
        // };
        public popup = async <ResultType>(builder: Tektite.PopupArguments<ResultType> | ((instance: Tektite.PopupInstance<ResultType>) => Promise<Tektite.PopupArguments<ResultType>>)) => await new Promise<ResultType>
        (
            async resolve =>
            {
                const instance =
                {
                    set: (value: ResultType) =>
                    {
                        result = value;
                        return instance;
                    },
                    close: () =>
                    {
                        ui.close();
                        return instance;
                    },
                    getDom: () => ui.dom,
                };
                const data = "function" === typeof builder ? await builder(instance): builder;
                let result: ResultType | null = data.initialValue ?? null;
                const dom = $make(HTMLDivElement)
                ({
                    tag: "div",
                    className: `tektite-popup tektite-locale-parallel-off ${data.className ?? ""}`,
                    children: data.children,
                    onclick: async (event: MouseEvent) =>
                    {
                        console.log("popup.click!");
                        event.stopPropagation();
                        //getScreenCoverList.forEach(i => i.click());
                    },
                });
                const close = async () =>
                {
                    await data.onClose?.();
                    resolve(result);
                    screenCover.close();
                };
                // minamo.dom.appendChildren(document.body, dom);
                const screenCover = this.cover
                ({
                    children:
                    [
                        dom,
                        { tag: "div", }, // レイアウト調整用のダミー要素 ( この調整がないとポップアップが小さく且つ入力要素がある場合に iPad でキーボードの下に dom が隠れてしまう。 )
                    ],
                    onclick: async () =>
                    {
                        await data.onClose?.();
                        resolve(result);
                        //minamo.dom.remove(dom);
                    },
                });
                const ui =
                {
                    dom,
                    close,
                };
            }
        );
        lastMouseDownTarget: EventTarget = null;
        public onMouseDown = (event: MouseEvent) => this.lastMouseDownTarget = event.target;
        public onMouseUp = (_evnet: MouseEvent) => setTimeout(this.clearLastMouseDownTarget, 10);
        public clearLastMouseDownTarget = () => this.lastMouseDownTarget = null;
        replaceBody = async (body: Tektite.PageSource | minamo.dom.Source) => minamo.dom.replaceChildren
        (
            document.getElementById("tektite-screen-body"),
            await this.makeBody(body)
        );
        scrollToOffset = async (target: HTMLElement, offset: number) =>
        {
            let scrollTop = target.scrollTop;
            let diff = offset -scrollTop;
            for(let i = 0; i < 25; ++i)
            {
                diff *= 0.8;
                target.scrollTo(0, offset -diff);
                await minamo.core.timeout(10);
            }
            target.scrollTo(0, offset);
        };
        scrollToElement = async (target: HTMLElement) =>
        {
            const parent = target.parentElement;
            const targetOffsetTop = Math.min(target.offsetTop -parent.offsetTop, parent.scrollHeight -parent.clientHeight);
            await this.scrollToOffset(parent, targetOffsetTop);
        };
        getBodyScrollTop = (topChild = minamo.dom.getDivsByClassName(document, "tektite-primary-page")[0]) =>
        {
            const body = document.getElementById("tektite-screen-body");
            const primaryPageOffsetTop = Math.min(topChild.offsetTop -body.offsetTop, body.scrollHeight -body.clientHeight);
            return body.scrollTop -primaryPageOffsetTop;
        };
        isStrictShowPrimaryPage = () => 0 === this.getBodyScrollTop();
        downPageLink = async () =>
        ({
            tag: "div",
            className: "tektite-down-page-link tektite-icon",
            children: await this.tektite.loadSvgOrCache("tektite-down-triangle-icon"),
            onclick: async () =>
            {
                if (this.isStrictShowPrimaryPage())
                {
                    await this.scrollToElement(minamo.dom.getDivsByClassName(document, "tektite-trail-page")[0]);
                }
                else
                {
                    await this.scrollToElement(minamo.dom.getDivsByClassName(document, "tektite-primary-page")[0]);
                }
            },
        });
        adjustPageFooterPosition = () =>
        {
            const primaryPage = document.getElementsByClassName("tektite-primary-page")[0];
            if (primaryPage)
            {
                const body = document.getElementById("tektite-screen-body");
                const delta = Math.max(primaryPage.clientHeight -(body.clientHeight +this.getBodyScrollTop()), 0);
                minamo.dom.getDivsByClassName(document, "tektite-page-footer")
                    .forEach(i => minamo.dom.setStyleProperty(i, "paddingBottom", `calc(1rem + ${delta}px)`));
                // minamo.dom.getDivsByClassName(document, "tektite-down-page-link")
                //     .forEach(i => minamo.dom.setStyleProperty(i, "bottom", `calc(1rem + ${delta}px)`));
            }
        };
        adjustDownPageLinkDirection = () =>
            minamo.dom.getDivsByClassName(document, "tektite-down-page-link")
                .forEach(i => minamo.dom.toggleCSSClass(i, "tektite-reverse-down-page-link", ! this.isStrictShowPrimaryPage()));
        public lastScreenName?: string;
        public setClass = (className?: string) =>
        {
            if (undefined !== this.lastScreenName)
            {
                this.getElement().classList.remove(this.lastScreenName);
            }
            if (undefined !== className)
            {
                this.getElement().classList.add(className);
            }
            this.lastScreenName = className;
        }
        public show = async (screen: Tektite.ScreenSource<PageParams, IconKeyType>, updateScreen?: (event: Tektite.UpdateScreenEventEype) => unknown) =>
        {
            if (undefined !== updateScreen)
            {
                this.update = updateScreen;
            }
            else
            {
                this.update = async (event: Tektite.UpdateScreenEventEype) =>
                {
                    if ("storage" === event || "operate" === event)
                    {
                        await this.tektite.reload();
                    }
                };
            }
            this.tektite.resetProgress();
            this.setClass(screen.className);
            this.header.replace(screen.header);
            await this.replaceBody(screen.body);
            this.adjustPageFooterPosition();
            this.adjustDownPageLinkDirection();
        };
        public makeBody = async (body: Tektite.PageSource | minamo.dom.Source) =>
            undefined === (body as Tektite.PageSource).primary ?
                body as minamo.dom.Source:
                await this.makePage((body as Tektite.PageSource).primary, (body as Tektite.PageSource).trail);
        public makePage = async (primary: Tektite.PrimaryPageSource | minamo.dom.Source, trail?: minamo.dom.Source) =>
        [
            Tektite.$div("tektite-primary-page")
            ([
                Tektite.$div("tektite-page-body")
                (
                    Tektite.$div("tektite-main-panel")
                    (
                        undefined === (primary as Tektite.PrimaryPageSource).body ?
                            primary as minamo.dom.Source:
                            (primary as Tektite.PrimaryPageSource).body
                    )
                ),
                Tektite.$div("tektite-page-footer")
                (
                    undefined !== (primary as Tektite.PrimaryPageSource).footer ?
                        (primary as Tektite.PrimaryPageSource).footer:
                        (
                            undefined !== trail ?
                            await this.downPageLink():
                            []
                        )
                ),
            ]),
            undefined !== trail ?
                Tektite.$div("tektite-trail-page")(trail):
                [],
        ];
    }
    export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new Screen(tektite);
}
