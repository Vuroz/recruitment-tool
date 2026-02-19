import { redirect } from "next/navigation";


export default async function ApplicationWrongRoute() {
    redirect("/portal");
}