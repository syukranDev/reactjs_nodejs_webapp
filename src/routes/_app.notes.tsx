import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, ApiError } from "@/lib/api";

type NoteRow = {
  id: string;
  title: string;
  body: string | null;
  created_by: string | null;
  created_at: string;
};

type NoteListResponse = {
  status: string;
  notes: {
    rows: NoteRow[];
    count: number;
  };
};

export const Route = createFileRoute("/_app/notes")({
  component: NotesPage,
});

function NotesPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const listQuery = useQuery({
    queryKey: ["notes"],
    queryFn: () => api.get<NoteListResponse>("/a/note/list"),
  });

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      await api.post("/a/note/create", { title: title.trim(), body });
      setTitle("");
      setBody("");
      toast.success("Note created");
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create note");
    } finally {
      setSaving(false);
    }
  }

  const rows = listQuery.data?.notes.rows ?? [];

  return (
    <div className="space-y-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>New note</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={(event) => void handleCreate(event)}>
            <div className="space-y-2">
              <Label htmlFor="note-title">Title</Label>
              <Input id="note-title" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-body">Body</Label>
              <Input id="note-body" value={body} onChange={(event) => setBody(event.target.value)} />
            </div>
            <Button type="submit" disabled={saving}>
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Body</TableHead>
                <TableHead>Created by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>{row.body}</TableCell>
                  <TableCell>{row.created_by}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    {listQuery.isLoading ? "Loading…" : "No notes yet."}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
