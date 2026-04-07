import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

const DESIGN_DIR = path.resolve(process.cwd(), ".dev", "design");

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
};

type RouteContext = {
  params: {
    slug?: string[];
  };
};

function resolveFilePath(segments: string[] | undefined): string | null {
  const requestedPath = segments && segments.length > 0 ? segments.join("/") : "index.html";
  const normalizedPath = path.posix.normalize(requestedPath);

  if (
    normalizedPath === ".." ||
    normalizedPath.startsWith("../") ||
    normalizedPath.includes("/../")
  ) {
    return null;
  }

  const resolvedPath = path.resolve(DESIGN_DIR, normalizedPath);
  const isInsideDesignDir =
    resolvedPath === DESIGN_DIR || resolvedPath.startsWith(`${DESIGN_DIR}${path.sep}`);

  return isInsideDesignDir ? resolvedPath : null;
}

function getContentType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  return MIME_TYPES[extension] ?? "application/octet-stream";
}

export async function GET(_: Request, { params }: RouteContext) {
  const filePath = resolveFilePath(params.slug);

  if (!filePath) {
    return new NextResponse("Arquivo invalido.", { status: 400 });
  }

  try {
    const stats = await fs.stat(filePath);

    if (!stats.isFile()) {
      return new NextResponse("Arquivo nao encontrado.", { status: 404 });
    }

    const content = await fs.readFile(filePath);

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": getContentType(filePath),
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return new NextResponse("Arquivo nao encontrado.", { status: 404 });
  }
}
