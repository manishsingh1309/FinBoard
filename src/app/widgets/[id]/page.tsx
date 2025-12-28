"use client"

import WidgetDetail from "./widget-detail"

export default function Page({ params }: { params: { id: string } }) {
  return <WidgetDetail id={params.id} />
}
