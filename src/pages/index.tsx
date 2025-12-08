import { useForm } from "react-hook-form";
import apiFetch from "../lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableCaption,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";

type Staff = { id: string; name: string; role?: string };

async function fetchStaff() {
  return apiFetch("/api/staff") as Promise<Staff[]>;
}

async function createStaff(body: Partial<Staff>) {
  return apiFetch("/api/staff", {
    method: "POST",
    body: JSON.stringify(body),
  }) as Promise<Staff>;
}

export default function StaffPage() {
  const qc = useQueryClient();
  const { data: staff, isLoading } = useQuery<Staff[], Error>({
    queryKey: ["staff"],
    queryFn: fetchStaff,
  });
  const create = useMutation({
    mutationFn: createStaff,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
  const form = useForm<{ name: string }>();

  async function onSubmit(values: { name: string }) {
    await create.mutateAsync({ name: values.name });
    form.reset();
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Staff</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-3">
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...form.register("name", { required: "Name is required" })} />
            </FormControl>
            <FormMessage />
          </FormItem>

          <Button type="submit" disabled={create.isPending}>
            Add
          </Button>
        </form>
      </Form>

      <Table>
        <TableHead>
          <tr>
            <th>Name</th>
            <th>Role</th>
          </tr>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell>Loading…</TableCell>
              <TableCell />
            </TableRow>
          ) : (
            staff?.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.role ?? "-"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <TableCaption>Staff</TableCaption>
      </Table>
    </div>
  );
}
