"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CommitteeItem } from "@/lib/masjid/masjid-profile";

type CommitteeOrgChartProps = {
  items: CommitteeItem[];
};

type CommitteeNode = {
  name: string;
  role: string;
  imageUrl: string;
};

function getInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (words.length === 0) {
    return "?";
  }

  return words.map((word) => word[0]?.toUpperCase() ?? "").join("");
}

function splitAdvisoryLeads(leads: string) {
  return leads
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !/^kasepuhan$/i.test(item));
}

function isAdvisory(section: string) {
  return /penasehat|pembina/i.test(section);
}

function isLeader(section: string) {
  return /ketua|pic utama/i.test(section) && !/wakil/i.test(section);
}

function isViceLeader(section: string) {
  return /wakil ketua/i.test(section);
}

function isSecretary(section: string) {
  return /sekretaris/i.test(section);
}

function isTreasurer(section: string) {
  return /bendahara/i.test(section);
}

function toNode(item: CommitteeItem): CommitteeNode {
  return {
    name: item.leads.trim() || "Nama belum diisi",
    role: item.section.trim() || "Jabatan",
    imageUrl: item.imageUrl.trim(),
  };
}

function getCommitteeLayers(items: CommitteeItem[]) {
  const advisoryNodes = items
    .filter((item) => isAdvisory(item.section))
    .flatMap((item) => {
      const names = splitAdvisoryLeads(item.leads);

      if (names.length <= 1) {
        return [toNode(item)];
      }

      return names.map((name, index) => ({
        name,
        role: `Penasehat ${index + 1}`,
        imageUrl: "",
      }));
    });

  const leaderNodes = items
    .filter((item) => isLeader(item.section) || isViceLeader(item.section))
    .map(toNode);

  const adminNodes = items
    .filter((item) => isSecretary(item.section) || isTreasurer(item.section))
    .map(toNode);

  const sectionNodes = items
    .filter(
      (item) =>
        !isAdvisory(item.section) &&
        !isLeader(item.section) &&
        !isViceLeader(item.section) &&
        !isSecretary(item.section) &&
        !isTreasurer(item.section),
    )
    .map(toNode);

  return {
    advisoryNodes,
    leaderNodes,
    adminNodes,
    sectionNodes,
  };
}

function connectorInset(count: number) {
  if (count <= 1) {
    return "left-1/2 right-1/2";
  }

  if (count === 2) {
    return "left-[25%] right-[25%]";
  }

  if (count === 3) {
    return "left-[16.5%] right-[16.5%]";
  }

  return "left-[10%] right-[10%]";
}

function ChartRow({
  nodes,
  columns,
  connectFromAbove = false,
  className = "",
}: {
  nodes: CommitteeNode[];
  columns: string;
  connectFromAbove?: boolean;
  className?: string;
}) {
  if (nodes.length === 0) {
    return null;
  }

  return (
    <div className={`${connectFromAbove ? "relative pt-12" : "relative"} ${className}`}>
      {connectFromAbove ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-12 md:block">
          <div className="absolute left-1/2 top-0 h-6 w-px -translate-x-1/2 bg-emerald-200" />
          {nodes.length > 1 ? (
            <div className={`absolute top-6 h-px bg-emerald-200 ${connectorInset(nodes.length)}`} />
          ) : null}
        </div>
      ) : null}

      <div className={`grid gap-x-8 gap-y-10 ${columns}`}>
        {nodes.map((node, index) => (
          <div key={`${node.role}-${node.name}-${index}`} className="relative flex justify-center">
            {connectFromAbove ? (
              <div className="pointer-events-none absolute -top-12 left-1/2 hidden h-12 w-px -translate-x-1/2 bg-emerald-200 md:block" />
            ) : null}
            <ProfileNode node={node} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileNode({ node }: { node: CommitteeNode }) {
  return (
    <div className="flex w-full max-w-[220px] flex-col items-center text-center">
      <Avatar
        size="default"
        className="h-32 w-32 border border-emerald-200 bg-emerald-50 text-emerald-950 shadow-[0_14px_40px_rgba(15,23,42,0.12)] sm:h-36 sm:w-36"
      >
        {node.imageUrl ? (
          <AvatarImage src={node.imageUrl} alt={node.name} className="object-cover" />
        ) : null}
        <AvatarFallback className="bg-emerald-50 text-2xl font-semibold text-current sm:text-3xl">
          {getInitials(node.name)}
        </AvatarFallback>
      </Avatar>

      <p className="mt-5 text-sm font-semibold text-emerald-950 sm:text-base">{node.name}</p>
      <p className="mt-1 text-xs text-emerald-700 sm:text-sm">{node.role}</p>
    </div>
  );
}

export function CommitteeOrgChart({ items }: CommitteeOrgChartProps) {
  const { advisoryNodes, leaderNodes, adminNodes, sectionNodes } = getCommitteeLayers(items);

  if (
    advisoryNodes.length === 0 &&
    leaderNodes.length === 0 &&
    adminNodes.length === 0 &&
    sectionNodes.length === 0
  ) {
    return null;
  }

  return (
    <div className="rounded-[2rem] px-6 py-10 sm:px-8 sm:py-12">
      <div className="space-y-14">
        <ChartRow nodes={advisoryNodes} columns="grid-cols-1 gap-y-12 md:grid-cols-3" />
        <ChartRow
          nodes={leaderNodes}
          columns="mx-auto max-w-3xl grid-cols-1 gap-y-12 md:grid-cols-2"
          connectFromAbove={advisoryNodes.length > 0}
        />
        <ChartRow
          nodes={adminNodes}
          columns="mx-auto max-w-3xl grid-cols-1 gap-y-12 md:grid-cols-2"
          connectFromAbove={leaderNodes.length > 0}
        />
        <ChartRow
          nodes={sectionNodes}
          columns="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 space-y-8"
          connectFromAbove={adminNodes.length > 0 || leaderNodes.length > 0}
          className="pt-8 md:pt-14"
        />
      </div>
    </div>
  );
}
