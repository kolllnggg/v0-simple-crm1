"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Search,
  Upload,
  Download,
  Plus,
  Phone,
  Globe,
  ArrowUpDown,
  Trash2,
  Share2,
  Copy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { encodeUrlSafeJson, decodeUrlSafeJson } from "@/lib/urlSafeJson"

interface Contact {
  id: string
  name: string
  phone: string
  website: string
  tipo_site: string
  status: string
  observations: string
}

const getStatusColor = (status: string) => {
  if (status === "ON") return "bg-green-100 text-green-800 border-green-200"
  if (status.startsWith("OFF")) return "bg-red-100 text-red-800 border-red-200"
  if (status === "Entrar em contato") return "bg-yellow-100 text-yellow-800 border-yellow-200"
  if (status === "Não quer") return "bg-red-100 text-red-800 border-red-200"
  if (status === "Fazer") return "bg-blue-100 text-blue-800 border-blue-200"
  if (status === "Fechado") return "bg-green-100 text-green-800 border-green-200"
  if (status === "ligar") return "bg-blue-100 text-blue-800 border-blue-200"
  if (status === "ligar novamente") return "bg-yellow-100 text-yellow-800 border-yellow-200"
  if (status === "não quis") return "bg-red-100 text-red-800 border-red-200"
  if (status === "fazer site") return "bg-purple-100 text-purple-800 border-purple-200"
  if (status === "cliente fechado") return "bg-green-100 text-green-800 border-green-200"
  return "bg-gray-100 text-gray-800 border-gray-200"
}

const getStatusIcon = (status: string) => {
  if (status === "ON") return "✅"
  if (status.startsWith("OFF")) return "❌"
  if (status === "Entrar em contato") return "📞"
  if (status === "Não quer") return "❌"
  if (status === "Fazer") return "⚡"
  if (status === "Fechado") return "✅"
  if (status === "ligar") return "📞"
  if (status === "ligar novamente") return "🔄"
  if (status === "não quis") return "❌"
  if (status === "fazer site") return "🌐"
  if (status === "cliente fechado") return "✅"
  return "📋"
}

const DEFAULT_STATUS_OPTIONS = ["ligar", "ligar novamente", "não quis", "fazer site", "cliente fechado"]

const SAMPLE_CONTACTS: Omit<Contact, "id">[] = [
  {
    name: "Abrazzo - Psicologia e Desenvolvimento Humano",
    phone: "5521998765432",
    website: "https://abrazzo.com.br",
    tipo_site: "site próprio",
    status: "ligar",
    observations: "",
  },
  {
    name: "AC Clínica E Consultório De Psicologia",
    phone: "5521987654321",
    website: "",
    tipo_site: "sem site",
    status: "ligar",
    observations: "",
  },
  {
    name: "Academia Da Família - Psicologia",
    phone: "5521976543210",
    website: "",
    tipo_site: "sem site",
    status: "ligar",
    observations: "",
  },
  {
    name: "Acassia Farias Psicologia",
    phone: "5521965432109",
    website: "",
    tipo_site: "sem site",
    status: "ligar",
    observations: "",
  },
  {
    name: "Adapt Psicologia",
    phone: "5521954321098",
    website: "https://adaptpsicologia.com.br",
    tipo_site: "site próprio",
    status: "ligar",
    observations: "",
  },
  {
    name: "Adriana Santos - Psicóloga Clínica",
    phone: "5521943210987",
    website: "https://instagram.com/adrianasantospsi",
    tipo_site: "agregador/social",
    status: "ligar",
    observations: "",
  },
  {
    name: "Aline Ferreira Psicologia",
    phone: "5521932109876",
    website: "",
    tipo_site: "sem site",
    status: "ligar",
    observations: "",
  },
  {
    name: "Ana Clara - Terapia Cognitivo Comportamental",
    phone: "5521921098765",
    website: "https://sites.google.com/view/anaclarapsicologia",
    tipo_site: "agregador/social",
    status: "ligar",
    observations: "",
  },
  {
    name: "Bruno Oliveira - Psicólogo Organizacional",
    phone: "5521910987654",
    website: "https://brunooliveirapsico.com.br",
    tipo_site: "site próprio",
    status: "ligar",
    observations: "",
  },
  {
    name: "Camila Rodrigues - Psicologia Infantil",
    phone: "5521909876543",
    website: "",
    tipo_site: "sem site",
    status: "ligar",
    observations: "",
  },
]

const generateShortCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const GLOBAL_DATA_KEY = "crm_global_data"

export default function CRMPage() {
  const { toast } = useToast()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [contactsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<keyof Contact>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isInitialLoad = useRef(true)

  useEffect(() => {
    if (!isInitialLoad.current) return

    const loadGlobalData = () => {
      try {
        const globalData = localStorage.getItem(GLOBAL_DATA_KEY)
        if (globalData) {
          const parsed = JSON.parse(globalData)
          setContacts(parsed)
          setFilteredContacts(parsed)
          return true
        }
      } catch (error) {
        console.error("Error loading global data:", error)
      }
      return false
    }

    const urlParams = new URLSearchParams(window.location.search)
    const dataParam = urlParams.get("data")
    const codeParam = urlParams.get("c")

    if (codeParam) {
      try {
        const storedData = localStorage.getItem(`crm_share_${codeParam}`)
        if (storedData) {
          const parsedData = JSON.parse(storedData)
          localStorage.setItem(GLOBAL_DATA_KEY, JSON.stringify(parsedData))
          setContacts(parsedData)
          setFilteredContacts(parsedData)
          toast({
            title: "Dados Globais Carregados",
            description: `${parsedData.length} contatos agora disponíveis para todos os usuários.`,
          })
        } else {
          toast({
            title: "Link Inválido",
            description: "Os dados compartilhados não foram encontrados.",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Erro ao Carregar",
          description: "Não foi possível carregar os dados compartilhados.",
          variant: "destructive",
        })
      }
    } else if (dataParam) {
      try {
        const parsedData = decodeUrlSafeJson(dataParam)
        localStorage.setItem(GLOBAL_DATA_KEY, JSON.stringify(parsedData))
        setContacts(parsedData)
        setFilteredContacts(parsedData)
        toast({
          title: "Dados Globais Carregados",
          description: `${parsedData.length} contatos agora disponíveis para todos os usuários.`,
        })
        window.history.replaceState({}, document.title, window.location.pathname)
      } catch (error) {
        console.error("Error loading shared data:", error)
      }
    } else if (!loadGlobalData()) {
      const savedContacts = localStorage.getItem("crm-contacts")
      if (savedContacts) {
        const parsed = JSON.parse(savedContacts)
        localStorage.setItem(GLOBAL_DATA_KEY, JSON.stringify(parsed))
        setContacts(parsed)
        setFilteredContacts(parsed)
        localStorage.removeItem("crm-contacts")
      }
    }

    isInitialLoad.current = false
  }, [])

  useEffect(() => {
    if (isInitialLoad.current) return
    localStorage.setItem(GLOBAL_DATA_KEY, JSON.stringify(contacts))
  }, [contacts])

  useEffect(() => {
    const filtered = contacts.filter((contact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.tipo_site.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || contact.status === statusFilter

      return matchesSearch && matchesStatus
    })

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortField]?.toString().toLowerCase() || ""
      const bValue = b[sortField]?.toString().toLowerCase() || ""

      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })

    setFilteredContacts(sorted)
    setCurrentPage(1)
  }, [contacts, searchTerm, statusFilter, sortField, sortDirection])

  const indexOfLastContact = currentPage * contactsPerPage
  const indexOfFirstContact = indexOfLastContact - contactsPerPage
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact)
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage)

  const handleSort = (field: keyof Contact) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const arrayBuffer = await file.arrayBuffer()
      let text = ""

      const uint8Array = new Uint8Array(arrayBuffer)
      if (uint8Array[0] === 0xef && uint8Array[1] === 0xbb && uint8Array[2] === 0xbf) {
        const decoder = new TextDecoder("utf-8")
        text = decoder.decode(uint8Array.slice(3))
      } else {
        const encodings = ["utf-8", "iso-8859-1", "windows-1252"]
        for (const encoding of encodings) {
          try {
            const decoder = new TextDecoder(encoding)
            text = decoder.decode(uint8Array)
            if (!text.includes("")) break
          } catch (e) {
            continue
          }
        }
      }

      text = text.normalize("NFC")

      const separator = text.includes("\t") ? "\t" : ","
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length === 0) {
        toast({
          title: "Arquivo Vazio",
          description: "O arquivo CSV está vazio.",
          variant: "destructive",
        })
        return
      }

      const hasHeader =
        lines[0].toLowerCase().includes("name") ||
        lines[0].toLowerCase().includes("nome") ||
        lines[0].toLowerCase().includes("phone") ||
        lines[0].toLowerCase().includes("telefone")

      const dataLines = hasHeader ? lines.slice(1) : lines
      const newContacts: Contact[] = []

      for (const line of dataLines) {
        if (!line.trim()) continue

        const values = []
        let current = ""
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === separator && !inQuotes) {
            values.push(current.trim().replace(/^"|"$/g, ""))
            current = ""
          } else {
            current += char
          }
        }
        values.push(current.trim().replace(/^"|"$/g, ""))

        if (values.length >= 4) {
          const [name, phone, website, tipo_site, importedStatus] = values

          if (name && name.trim()) {
            const cleanPhone = phone?.toString().replace(/\D/g, "") || ""
            const cleanWebsite = website?.trim() || ""
            const cleanTipoSite = tipo_site?.trim() || "sem site"

            const existingContact = contacts.find(
              (c) => c.name.toLowerCase() === name.trim().toLowerCase() || (cleanPhone && c.phone === cleanPhone),
            )

            if (!existingContact) {
              newContacts.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: name.trim(),
                phone: cleanPhone,
                website: cleanWebsite,
                tipo_site: cleanTipoSite,
                status: "ligar",
                observations: "",
              })
            }
          }
        }
      }

      if (newContacts.length > 0) {
        const updatedContacts = [...contacts, ...newContacts]
        setContacts(updatedContacts)

        const baseUrl = window.location.origin + window.location.pathname
        const encoded = encodeUrlSafeJson(updatedContacts)
        const globalUrl = `${baseUrl}?data=${encoded}`

        toast({
          title: "Dados Importados Globalmente",
          description: `${newContacts.length} novos contatos importados e disponíveis para todos os usuários.`,
        })

        setShareUrl(globalUrl)
        setIsShareDialogOpen(true)
      } else {
        toast({
          title: "Nenhum Contato Novo",
          description: "Todos os contatos já existem na base de dados.",
        })
      }
    } catch (error) {
      console.error("CSV Import Error:", error)
      toast({
        title: "Erro na Importação",
        description: "Não foi possível importar o arquivo CSV. Verifique o formato.",
        variant: "destructive",
      })
    }

    event.target.value = ""
  }

  const handleCSVExport = () => {
    const headers = ["name", "phone", "website", "tipo_site", "status"]
    const csvContent = [
      headers.join("\t"),
      ...contacts.map((contact) => {
        const statusWithObs = contact.observations ? `${contact.status} (${contact.observations})` : contact.status
        return [contact.name, contact.phone, contact.website, contact.tipo_site, statusWithObs]
          .map((field) => `"${field}"`)
          .join("\t")
      }),
    ].join("\n")

    const BOM = "\uFEFF"
    const csvWithBOM = BOM + csvContent

    const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `crm-contatos-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "CSV Exportado",
      description: `${contacts.length} contatos exportados com sucesso.`,
    })
  }

  const handleAddContact = () => {
    const contact: Contact = {
      name: "",
      phone: "",
      website: "",
      tipo_site: "",
      status: "",
      observations: "",
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }

    setContacts((prev) => [...prev, contact])
    setIsAddDialogOpen(false)

    toast({
      title: "Contato Adicionado",
      description: `${contact.name} foi adicionado com sucesso.`,
    })
  }

  const updateContact = (id: string, field: keyof Contact, value: string) => {
    setContacts((prev) => prev.map((contact) => (contact.id === id ? { ...contact, [field]: value } : contact)))
  }

  const setQuickStatus = (contactId: string, status: string) => {
    updateContact(contactId, "status", status)
  }

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id))
    toast({
      title: "Contato Removido",
      description: "Contato removido com sucesso.",
    })
  }

  const handleRemoveAllContacts = () => {
    if (contacts.length === 0) return

    const confirmed = window.confirm(
      `Tem certeza que deseja remover todos os ${contacts.length} contatos? Esta ação não pode ser desfeita.`,
    )

    if (confirmed) {
      setContacts([])
      toast({
        title: "Todos os Contatos Removidos",
        description: "Todos os contatos foram removidos com sucesso.",
      })
    }
  }

  const loadSampleData = () => {
    const sampleContacts: Contact[] = SAMPLE_CONTACTS.map((contact, index) => ({
      ...contact,
      id: `sample-${Date.now()}-${index}`,
    }))

    const existingKeys = new Set(contacts.map((c) => `${c.name.toLowerCase().trim()}-${c.phone.replace(/\D/g, "")}`))

    const uniqueSampleContacts = sampleContacts.filter((c) => {
      const key = `${c.name.toLowerCase().trim()}-${c.phone.replace(/\D/g, "")}`
      return !existingKeys.has(key)
    })

    setContacts((prev) => [...prev, ...uniqueSampleContacts])

    toast({
      title: "Dados de Exemplo Carregados",
      description: `${uniqueSampleContacts.length} contatos de exemplo adicionados.`,
    })
  }

  const generateShareUrl = () => {
    const baseUrl = window.location.origin + window.location.pathname
    const encoded = encodeUrlSafeJson(contacts)
    const url = `${baseUrl}?data=${encoded}`
    setShareUrl(url)
    setIsShareDialogOpen(true)
  }

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "URL Copiada",
        description: "Link compartilhável copiado para a área de transferência.",
      })
    } catch (error) {
      const textArea = document.createElement("textarea")
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)

      toast({
        title: "URL Copiada",
        description: "Link compartilhável copiado para a área de transferência.",
      })
    }
  }

  const statusFilterOptions = DEFAULT_STATUS_OPTIONS

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">CRM de Contatos</h1>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Importar CSV</span>
                <span className="sm:hidden">Import</span>
              </Button>
              <Button onClick={handleCSVExport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Exportar CSV</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <Button onClick={loadSampleData} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Dados Exemplo</span>
                <span className="sm:hidden">Exemplo</span>
              </Button>
              <Button onClick={generateShareUrl} variant="outline" size="sm" disabled={contacts.length === 0}>
                <Share2 className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Compartilhar</span>
                <span className="sm:hidden">Share</span>
              </Button>
              <Button
                onClick={handleRemoveAllContacts}
                variant="destructive"
                size="sm"
                disabled={contacts.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Remover Todos</span>
                <span className="sm:hidden">Limpar</span>
              </Button>
              <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleCSVImport} className="hidden" />
            </div>

            <div className="text-xs md:text-sm text-gray-600">
              {filteredContacts.length > 0 ? (
                <>
                  {indexOfFirstContact + 1}-{Math.min(indexOfLastContact, filteredContacts.length)} de{" "}
                  {filteredContacts.length} contatos
                  {filteredContacts.length !== contacts.length && ` (${contacts.length} total)`}
                </>
              ) : (
                `0 de ${contacts.length} contatos`
              )}
            </div>
          </div>
        </div>

        <Card className="mb-4 md:mb-6">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4 items-stretch sm:items-center">
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {statusFilterOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900">
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-1 hover:text-blue-600"
                      >
                        Nome
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">
                      <button
                        onClick={() => handleSort("phone")}
                        className="flex items-center gap-1 hover:text-blue-600"
                      >
                        Telefone
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">Website</th>
                    <th className="text-left p-4 font-medium text-gray-900">
                      <button
                        onClick={() => handleSort("tipo_site")}
                        className="flex items-center gap-1 hover:text-blue-600"
                      >
                        Tipo de Site
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">
                      <button
                        onClick={() => handleSort("status")}
                        className="flex items-center gap-1 hover:text-blue-600"
                      >
                        Status
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">Observações</th>
                    <th className="text-left p-4 font-medium text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {currentContacts.map((contact) => (
                    <tr key={contact.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <Input
                          value={contact.name}
                          onChange={(e) => updateContact(contact.id, "name", e.target.value)}
                          className="border-0 bg-transparent p-0 focus:bg-white focus:border focus:p-2"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Input
                            value={contact.phone}
                            onChange={(e) => updateContact(contact.id, "phone", e.target.value)}
                            className="border-0 bg-transparent p-0 focus:bg-white focus:border focus:p-2"
                          />
                          {contact.phone && (
                            <a href={`tel:${contact.phone}`} className="text-blue-600 hover:text-blue-800">
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Input
                            value={contact.website}
                            onChange={(e) => updateContact(contact.id, "website", e.target.value)}
                            className="border-0 bg-transparent p-0 focus:bg-white focus:border focus:p-2"
                            placeholder="Sem site"
                          />
                          {contact.website && (
                            <a
                              href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Globe className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Input
                          value={contact.tipo_site}
                          onChange={(e) => updateContact(contact.id, "tipo_site", e.target.value)}
                          className="border-0 bg-transparent p-0 focus:bg-white focus:border focus:p-2"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span>{getStatusIcon(contact.status)}</span>
                          <Select
                            value={contact.status}
                            onValueChange={(value: string) => updateContact(contact.id, "status", value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecionar status" />
                            </SelectTrigger>
                            <SelectContent>
                              {DEFAULT_STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                      <td className="p-4">
                        <Input
                          value={contact.observations}
                          onChange={(e) => updateContact(contact.id, "observations", e.target.value)}
                          className="border-0 bg-transparent p-0 focus:bg-white focus:border focus:p-2"
                          placeholder="Observações..."
                        />
                      </td>
                      <td className="p-4">
                        <Button variant="destructive" size="sm" onClick={() => deleteContact(contact.id)}>
                          Remover
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden">
              {currentContacts.map((contact) => (
                <div key={contact.id} className="border-b p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Input
                      value={contact.name}
                      onChange={(e) => updateContact(contact.id, "name", e.target.value)}
                      className="font-medium text-base flex-1 mr-2 border-0 bg-transparent p-0 focus:bg-white focus:border focus:p-2"
                      placeholder="Nome"
                    />
                    <Button variant="destructive" size="sm" onClick={() => deleteContact(contact.id)}>
                      ×
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <Input
                        value={contact.phone}
                        onChange={(e) => updateContact(contact.id, "phone", e.target.value)}
                        className="flex-1 border-0 bg-transparent p-0 focus:bg-white focus:border focus:p-2"
                        placeholder="Telefone"
                      />
                      {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="text-blue-600">
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <Input
                        value={contact.website}
                        onChange={(e) => updateContact(contact.id, "website", e.target.value)}
                        className="flex-1 border-0 bg-transparent p-0 focus:bg-white focus:border focus:p-2"
                        placeholder="Website"
                      />
                      {contact.website && (
                        <a
                          href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Tipo de Site</label>
                      <Input
                        value={contact.tipo_site}
                        onChange={(e) => updateContact(contact.id, "tipo_site", e.target.value)}
                        className="w-full border-0 bg-transparent p-0 focus:bg-white focus:border focus:p-2"
                        placeholder="Tipo de site"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Status</label>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getStatusIcon(contact.status)}</span>
                        <Select
                          value={contact.status}
                          onValueChange={(value: string) => updateContact(contact.id, "status", value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {DEFAULT_STATUS_OPTIONS.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Observações</label>
                      <Input
                        value={contact.observations}
                        onChange={(e) => updateContact(contact.id, "observations", e.target.value)}
                        className="w-full border-0 bg-transparent p-0 focus:bg-white focus:border focus:p-2"
                        placeholder="Observações adicionais..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Anterior</span>
                  </Button>

                  <span className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <span className="hidden sm:inline mr-1">Próxima</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-xs text-gray-500">{contactsPerPage} por página</div>
              </div>
            )}

            {filteredContacts.length === 0 && (
              <div className="text-center py-12 text-gray-500 px-4">
                {contacts.length === 0
                  ? "Nenhum contato encontrado. Importe um CSV ou adicione contatos manualmente."
                  : "Nenhum contato corresponde aos filtros aplicados."}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="fixed bottom-4 right-4 md:bottom-6 md:right-6 rounded-full w-12 h-12 md:w-14 md:h-14 shadow-lg"
              size="icon"
            >
              <Plus className="w-5 h-5 md:w-6 md:h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Contato</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value=""
                  onChange={(e) => updateContact("", "name", e.target.value)}
                  placeholder="Nome do contato"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value=""
                  onChange={(e) => updateContact("", "phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value=""
                  onChange={(e) => updateContact("", "website", e.target.value)}
                  placeholder="www.exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="tipo_site">Tipo de Site</Label>
                <Input
                  id="tipo_site"
                  value=""
                  onChange={(e) => updateContact("", "tipo_site", e.target.value)}
                  placeholder="sem site, agregador/social, site próprio..."
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value="" onValueChange={(value: string) => updateContact("", "status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar status" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="observations">Observações</Label>
                <Input
                  id="observations"
                  value=""
                  onChange={(e) => updateContact("", "observations", e.target.value)}
                  placeholder="Observações adicionais..."
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddContact} className="flex-1">
                  Adicionar Contato
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent className="sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Dados Globais Compartilhados</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Estes dados estão agora disponíveis globalmente. Qualquer pessoa pode acessar e editar:
              </p>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="flex-1 text-xs" />
                <Button onClick={copyShareUrl} size="sm">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Link global com {contacts.length} contatos. Todos podem ver e editar estes dados.
              </p>
              <Button onClick={() => setIsShareDialogOpen(false)} className="w-full">
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
