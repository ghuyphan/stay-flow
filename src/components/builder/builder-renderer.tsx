"use client";

import { format } from "date-fns";
import { CheckCircle2, LockKeyhole } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { BookingPanel } from "@/components/booking/booking-panel";
import { CancelBookingButton } from "@/components/booking/cancel-booking-button";
import { PaymentActions } from "@/components/booking/payment-actions";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import { Container } from "@/components/layout/container";
import { HomestayCard } from "@/components/public-site/homestay-card";
import { RoomCard } from "@/components/public-site/room-card";
import { SearchBar } from "@/components/public-site/search-bar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import {
  textV2,
  type BuilderV2Block,
  type BuilderV2Config,
  type BuilderV2Page,
  type BuilderV2RouteId,
} from "@/lib/site-builder-v2";
import type { Homestay, Room } from "@/lib/types";
import type { StoredBooking } from "@/server/repositories/app-repository";
import { cn, formatCurrency } from "@/lib/utils";

export type BuilderRendererContext = {
  routeId: BuilderV2RouteId;
  homestays?: Homestay[];
  results?: Homestay[];
  homestay?: Homestay;
  room?: Room;
  booking?: StoredBooking;
  accessToken?: string;
  builderEditing?: {
    selectedBlockId?: string;
    onSelectBlock?: (blockId: string) => void;
    onTextChange?: (blockId: string, field: "eyebrow" | "title" | "subtitle" | "body" | "text" | "label", value: string, language: "en" | "vi") => void;
  };
};

export function BuilderRenderer({ config, page, context }: { config: BuilderV2Config; page: BuilderV2Page; context: BuilderRendererContext }) {
  return (
    <>
      {page.blocks.filter((block) => block.enabled).map((block) => (
        <RenderBlock key={block.id} block={block} config={config} context={context} />
      ))}
    </>
  );
}

function RenderBlock({ block, config, context }: { block: BuilderV2Block; config: BuilderV2Config; context: BuilderRendererContext }) {
  const { language, t } = useLanguage();
  const selected = context.builderEditing?.selectedBlockId === block.id;
  const children = block.children?.filter((child) => child.enabled).map((child) => (
    <RenderBlock key={child.id} block={child} config={config} context={context} />
  ));

  function select() {
    context.builderEditing?.onSelectBlock?.(block.id);
  }

  if (block.type === "Section") {
    return (
      <section className={cn(sectionPadding(block), selected && "ring-2 ring-primary/30")} onClickCapture={select}>
        {wrapWidth(block, children)}
      </section>
    );
  }

  if (block.type === "Container") {
    return <Container className={cn(sectionPadding(block), selected && "ring-2 ring-primary/30")} onClickCapture={select}>{children}</Container>;
  }

  if (block.type === "Grid" || block.type === "Columns") {
    return <div className={cn("grid", gapClass(block), columnsClass(block), selected && "ring-2 ring-primary/30")} onClickCapture={select}>{children}</div>;
  }

  if (block.type === "Stack") {
    return <div className={cn("grid", gapClass(block), alignClass(block), selected && "ring-2 ring-primary/30")} onClickCapture={select}>{children}</div>;
  }

  if (block.type === "Hero") {
    return (
      <section className={cn(sectionPadding(block), selected && "ring-2 ring-primary/30")} onClickCapture={select}>
        <Container className={cn(block.style.width === "narrow" && "max-w-3xl")}>
          <div className={cn(
            "relative overflow-hidden bg-card",
            block.style.layout === "centered" ? "px-5 py-14 text-center md:px-10" : "grid min-h-[420px] items-end md:min-h-[500px] md:grid-cols-[0.95fr_1.05fr]",
            radiusClass(block),
            borderClass(block),
            shadowClass(block),
          )}>
            {heroImage(block, context) ? (
              <div className={cn("relative min-h-[320px]", block.style.layout === "centered" ? "hidden" : "md:order-2 md:min-h-[500px]")}>
                <Image src={heroImage(block, context) ?? ""} alt={textV2(block.props.title, language) || "Hero image"} fill priority className="object-cover" sizes="100vw" />
              </div>
            ) : null}
            <div className={cn("relative z-10 p-6 md:p-10", block.style.layout === "centered" && "mx-auto max-w-2xl p-0")}>
              {block.props.eyebrow ? <p className="text-sm font-semibold text-accent">{editableText(block, "eyebrow", language, context)}</p> : null}
              <h1 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-6xl">{editableText(block, "title", language, context) || fallbackHeroTitle(context, t)}</h1>
              {block.props.subtitle ? <p className="mx-auto mt-4 max-w-xl text-muted-foreground md:text-lg">{editableText(block, "subtitle", language, context)}</p> : null}
              {block.props.href || block.props.label ? (
                <Button asChild className="mt-7 rounded-full">
                  <Link href={block.props.href || "/homestays"}>{editableText(block, "label", language, context) || t("common.book_now")}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (block.type === "Text") {
    return (
      <Container className={cn(sectionPadding(block), block.style.width === "narrow" && "max-w-3xl", alignClass(block), selected && "ring-2 ring-primary/30")} onClickCapture={select}>
        {block.props.eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{editableText(block, "eyebrow", language, context)}</p> : null}
        {block.props.title ? <h2 className="mt-1 text-3xl font-semibold tracking-tight">{editableText(block, "title", language, context)}</h2> : null}
        {block.props.body ? <p className="mt-3 leading-7 text-muted-foreground">{editableText(block, "body", language, context)}</p> : null}
        {block.dataBinding?.source === "homestays" ? <p className="mt-2 text-sm text-muted-foreground"><strong className="text-foreground">{(context.results ?? context.homestays ?? []).length}</strong> {textV2(block.props.body, language)}</p> : null}
      </Container>
    );
  }

  if (block.type === "Button") {
    return <Button asChild className={cn("rounded-full", selected && "ring-2 ring-primary/30")} onClickCapture={select}><Link href={block.props.href || "/"}>{editableText(block, "label", language, context)}</Link></Button>;
  }

  if (block.type === "Image") {
    const image = block.props.image || context.room?.image || context.homestay?.image;
    if (!image) return null;
    return <Container className={cn(sectionPadding(block), selected && "ring-2 ring-primary/30")} onClickCapture={select}><div className={cn("relative h-80 overflow-hidden", radiusClass(block))}><Image src={image} alt={textV2(block.props.alt, language) || "Website image"} fill className="object-cover" sizes="100vw" /></div></Container>;
  }

  if (block.type === "Gallery") {
    const images = (block.props.images?.length ? block.props.images : context.room?.gallery ?? context.homestay?.gallery ?? []).slice(0, 6);
    return (
      <Container className={cn(sectionPadding(block), selected && "ring-2 ring-primary/30")} onClickCapture={select}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => <div key={`${image}-${index}`} className="relative h-52 overflow-hidden rounded-[var(--radius-lg)]"><Image src={image} alt={`Gallery ${index + 1}`} fill className="object-cover" sizes="33vw" /></div>)}
        </div>
      </Container>
    );
  }

  if (block.type === "FeatureList") {
    const items = block.props.items?.length ? block.props.items : context.homestay?.amenities.map((amenity) => ({ id: amenity, title: { en: t(amenity), vi: t(amenity) } })) ?? [];
    return (
      <Container className={cn(sectionPadding(block), selected && "ring-2 ring-primary/30")} onClickCapture={select}>
        {block.props.title ? <h2 className="text-2xl font-semibold">{editableText(block, "title", language, context)}</h2> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => <span key={item.id} className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground">{textV2(item.title, language)}</span>)}
        </div>
      </Container>
    );
  }

  if (block.type === "FAQ") {
    return (
      <Container className={cn(sectionPadding(block), selected && "ring-2 ring-primary/30")} onClickCapture={select}>
        {block.props.title ? <h2 className="text-2xl font-semibold">{editableText(block, "title", language, context)}</h2> : null}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(block.props.faqs ?? []).map((faq) => <div key={faq.id} className="border-t border-border py-4"><h3 className="font-semibold">{textV2(faq.question, language)}</h3><p className="mt-1 text-sm text-muted-foreground">{textV2(faq.answer, language)}</p></div>)}
        </div>
      </Container>
    );
  }

  if (block.type === "Divider") return <Container><hr className="border-border" /></Container>;
  if (block.type === "Spacer") return <div className={block.props.height === "lg" ? "h-24" : block.props.height === "sm" ? "h-8" : "h-14"} />;
  if (block.type === "CustomLinkList") {
    return <Container className={cn(sectionPadding(block), selected && "ring-2 ring-primary/30")} onClickCapture={select}><div className="flex flex-wrap gap-3">{(block.props.links ?? config.site.footer.links).map((link) => <Button key={link.href} variant="outline" asChild><Link href={link.href}>{textV2(link.label, language)}</Link></Button>)}</div></Container>;
  }

  if (block.type === "SearchWidget") {
    return <Container className={cn(sectionPadding(block), selected && "ring-2 ring-primary/30")} onClickCapture={select}><SearchBar compact={context.routeId === "homestays"} defaultLocation={block.props.defaultLocation} enabledStayTypes={block.props.enabledStayTypes} /></Container>;
  }

  if (block.type === "HomestayCardList" || block.type === "HomestayGrid") {
    const source = block.dataBinding?.source === "featuredHomestays" ? context.homestays : context.results ?? context.homestays;
    const homestays = selectedHomestays(source ?? [], block);
    return (
      <Container className={cn(sectionPadding(block), selected && "ring-2 ring-primary/30")} onClickCapture={select}>
        {block.props.eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{editableText(block, "eyebrow", language, context)}</p> : null}
        {block.props.title ? <h2 className="mt-1 text-2xl font-semibold tracking-tight">{editableText(block, "title", language, context)}</h2> : null}
        {homestays.length ? (
          <div className={cn("mt-4 grid grid-cols-2 gap-3", block.type === "HomestayGrid" ? "lg:grid-cols-3" : "lg:grid-cols-4")}>
            {homestays.map((homestay) => <HomestayCard key={homestay.id} homestay={homestay} />)}
          </div>
        ) : <p className="py-12 text-center text-muted-foreground">{textV2(block.props.emptyText, language) || "No stays yet."}</p>}
      </Container>
    );
  }

  if (block.type === "RoomList") {
    if (!context.homestay) return <RequiredFallback label="Room list" />;
    return <RoomListBlock block={block} homestay={context.homestay} selected={selected} onSelect={select} />;
  }

  if (block.type === "BookingPanel") {
    if (!context.homestay) return <RequiredFallback label="Booking panel" />;
    return <BookingPanelBlock homestay={context.homestay} room={context.room} selected={selected} onSelect={select} />;
  }

  if (block.type === "PaymentPanel") {
    return context.booking && context.accessToken ? <PaymentPanelBlock booking={context.booking} accessToken={context.accessToken} selected={selected} onSelect={select} /> : <RequiredFallback label="Payment panel" />;
  }

  if (block.type === "BookingStatus") {
    return context.booking && context.accessToken ? <BookingStatusBlock booking={context.booking} accessToken={context.accessToken} selected={selected} onSelect={select} /> : <RequiredFallback label="Booking status" />;
  }

  if (block.type === "AIChatEntry") return null;
  return <>{children}</>;
}

function RoomListBlock({ block, homestay, selected, onSelect }: { block: BuilderV2Block; homestay: Homestay; selected: boolean; onSelect: () => void }) {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const queryRoomId = searchParams.get("room");
  const [selectedRoomId, setSelectedRoomId] = useState(queryRoomId && homestay.rooms.some((room) => room.id === queryRoomId) ? queryRoomId : homestay.rooms[0]?.id || "");
  return (
    <Container className={cn(sectionPadding(block), selected && "ring-2 ring-primary/30")} onClickCapture={onSelect}>
      {block.props.title ? <h2 className="text-2xl font-semibold">{textV2(block.props.title, language)}</h2> : null}
      <div className="mt-4 grid gap-3">{homestay.rooms.map((room) => <RoomCard key={room.id} room={room} slug={homestay.slug} isActive={room.id === selectedRoomId} onSelect={setSelectedRoomId} />)}</div>
    </Container>
  );
}

function BookingPanelBlock({ homestay, room, selected, onSelect }: { homestay: Homestay; room?: Room; selected: boolean; onSelect: () => void }) {
  const [selectedRoomId, setSelectedRoomId] = useState(room?.id || homestay.rooms[0]?.id || "");
  return (
    <Container className={cn("pb-20 lg:max-w-2xl lg:pb-24", selected && "ring-2 ring-primary/30")} onClickCapture={onSelect}>
      <BookingPanel homestayId={homestay.id} rooms={homestay.rooms} selectedRoomId={selectedRoomId} onRoomChange={setSelectedRoomId} />
    </Container>
  );
}

function PaymentPanelBlock({ booking, accessToken, selected, onSelect }: { booking: StoredBooking; accessToken: string; selected: boolean; onSelect: () => void }) {
  return (
    <Container className={cn("max-w-5xl py-10 lg:py-16", selected && "ring-2 ring-primary/30")} onClickCapture={onSelect}>
      <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-semibold text-primary">Booking {booking.bookingRef}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Review and pay</h1>
          <div className="mt-8 rounded-[var(--radius-lg)] bg-card p-6 shadow-[var(--shadow-sm)]">
            <h2 className="text-xl font-semibold">{booking.roomName}</h2>
            <p className="mt-1 text-muted-foreground">{booking.homestayName}</p>
            <dl className="mt-6 grid gap-5 sm:grid-cols-3">
              <div><dt className="text-xs text-muted-foreground">Check-in</dt><dd className="mt-1 font-semibold">{format(new Date(booking.checkIn), "MMM d, HH:mm")}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Check-out</dt><dd className="mt-1 font-semibold">{format(new Date(booking.checkOut), "MMM d, HH:mm")}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Guests</dt><dd className="mt-1 font-semibold">{booking.guestCount}</dd></div>
            </dl>
          </div>
        </div>
        <aside className="h-fit rounded-[var(--radius-lg)] bg-card p-6 shadow-[var(--shadow-sm)]">
          <h2 className="font-semibold">Price</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{booking.stayType} · {booking.durationLabel}</span><span>{formatCurrency(booking.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span>{formatCurrency(booking.fees)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Taxes</span><span>{formatCurrency(booking.taxes)}</span></div>
            <div className="flex justify-between rounded-xl bg-muted/45 p-3 text-lg font-semibold"><span>Total</span><span>{formatCurrency(booking.total)}</span></div>
          </div>
          <div className="mt-6"><PaymentActions bookingRef={booking.bookingRef} accessToken={accessToken} /></div>
          <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5" /> Payment state is confirmed on the server</p>
        </aside>
      </div>
    </Container>
  );
}

function BookingStatusBlock({ booking, accessToken, selected, onSelect }: { booking: StoredBooking; accessToken: string; selected: boolean; onSelect: () => void }) {
  return (
    <Container className={cn("max-w-3xl py-12 lg:py-20", selected && "ring-2 ring-primary/30")} onClickCapture={onSelect}>
      <div className="flex items-center gap-3">
        <CheckCircle2 className="size-8 text-success" />
        <div><BookingStatusBadge status={booking.status} /><h1 className="mt-2 font-display text-4xl font-semibold">Your stay at {booking.homestayName}</h1></div>
      </div>
      <div className="mt-10 grid gap-6 rounded-[var(--radius-lg)] bg-card p-6 shadow-[var(--shadow-sm)] sm:grid-cols-2">
        <div><p className="text-xs text-muted-foreground">Booking reference</p><p className="mt-1 font-semibold">{booking.bookingRef}</p></div>
        <div><p className="text-xs text-muted-foreground">Room</p><p className="mt-1 font-semibold">{booking.roomName}</p></div>
        <div><p className="text-xs text-muted-foreground">Time</p><p className="mt-1 font-semibold">{format(new Date(booking.checkIn), "MMM d, HH:mm")} - {format(new Date(booking.checkOut), "MMM d, HH:mm")}</p></div>
        <div><p className="text-xs text-muted-foreground">Stay type</p><p className="mt-1 font-semibold capitalize">{booking.stayType} · {booking.durationLabel}</p></div>
        <div><p className="text-xs text-muted-foreground">Total</p><p className="mt-1 font-semibold">{formatCurrency(booking.total)}</p></div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild><Link href="/homestays">Browse more stays</Link></Button>
        {!["cancelled", "checked_in", "checked_out", "refunded"].includes(booking.status) ? <CancelBookingButton bookingRef={booking.bookingRef} accessToken={accessToken} /> : null}
      </div>
    </Container>
  );
}

function RequiredFallback({ label }: { label: string }) {
  return <Container className="py-16"><div className="rounded-[var(--radius-lg)] border border-border bg-card p-6 text-center text-muted-foreground">{label} is unavailable for this route.</div></Container>;
}

function editableText(block: BuilderV2Block, field: "eyebrow" | "title" | "subtitle" | "body" | "text" | "label", language: "en" | "vi", context: BuilderRendererContext) {
  const value = textV2(block.props[field], language);
  if (!context.builderEditing?.onTextChange) return value;
  return (
    <span
      data-builder-editable="true"
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      tabIndex={0}
      className="rounded-md px-1 outline-none hover:bg-primary/10 focus:bg-card/80 focus:ring-2 focus:ring-primary/35"
      onFocus={() => context.builderEditing?.onSelectBlock?.(block.id)}
      onBlur={(event) => {
        const next = event.currentTarget.textContent?.trim() ?? "";
        if (next && next !== value) context.builderEditing?.onTextChange?.(block.id, field, next, language);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    >
      {value}
    </span>
  );
}

function selectedHomestays(homestays: Homestay[], block: BuilderV2Block) {
  const ids = block.dataBinding?.ids;
  const source = ids?.length ? ids.flatMap((id) => homestays.find((homestay) => homestay.id === id) ?? []) : homestays;
  return source.slice(0, block.dataBinding?.limit ?? 12);
}

function heroImage(block: BuilderV2Block, context: BuilderRendererContext) {
  return block.props.image || context.room?.image || context.homestay?.gallery[0] || context.homestay?.image || context.homestays?.[0]?.image;
}

function fallbackHeroTitle(context: BuilderRendererContext, t: (key: string) => string) {
  if (context.room) return t(context.room.name);
  if (context.homestay) return t(context.homestay.name);
  return "StayFlow";
}

function wrapWidth(block: BuilderV2Block, children: React.ReactNode) {
  if (block.style.width === "full") return children;
  return <Container className={cn(block.style.width === "narrow" && "max-w-3xl", block.style.width === "wide" && "max-w-[1440px]")}>{children}</Container>;
}

function sectionPadding(block: BuilderV2Block) {
  const value = block.style.paddingY?.base ?? "md";
  return { none: "py-0", sm: "py-4", md: "py-[var(--section-y-sm)]", lg: "py-[var(--section-y)]", xl: "py-20" }[value];
}

function gapClass(block: BuilderV2Block) {
  const value = block.style.gap?.base ?? "md";
  return { none: "gap-0", sm: "gap-2", md: "gap-4", lg: "gap-6", xl: "gap-10" }[value];
}

function columnsClass(block: BuilderV2Block) {
  const base = block.style.columns?.base ?? 1;
  const tablet = block.style.columns?.tablet ?? Math.min(base + 1, 3);
  const desktop = block.style.columns?.desktop ?? Math.min(tablet + 1, 4);
  return cn(base === 2 && "grid-cols-2", base === 3 && "grid-cols-3", tablet === 2 && "md:grid-cols-2", tablet === 3 && "md:grid-cols-3", desktop === 2 && "lg:grid-cols-2", desktop === 3 && "lg:grid-cols-3", desktop === 4 && "lg:grid-cols-4");
}

function alignClass(block: BuilderV2Block) {
  return block.style.align === "center" ? "text-center" : block.style.align === "right" ? "text-right" : "text-left";
}

function radiusClass(block: BuilderV2Block) {
  return block.style.radius === "none" ? "rounded-none" : block.style.radius === "sm" ? "rounded-[var(--radius-sm)]" : block.style.radius === "md" ? "rounded-[var(--radius-md)]" : block.style.radius === "full" ? "rounded-full" : "rounded-[var(--radius-lg)]";
}

function borderClass(block: BuilderV2Block) {
  return block.style.border ? "border border-border" : "";
}

function shadowClass(block: BuilderV2Block) {
  return block.style.shadow === "md" ? "shadow-[var(--shadow-md)]" : block.style.shadow === "sm" ? "shadow-[var(--shadow-sm)]" : "";
}
