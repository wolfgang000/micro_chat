defmodule MicroChat.RoomStore do
  use GenServer
  @table __MODULE__.Table

  defmodule RoomState do
    @moduledoc false
    @type t :: %__MODULE__{
            users: [map()]
          }

    defstruct users: []
  end

  def start_link(state), do: GenServer.start_link(__MODULE__, state, name: __MODULE__)

  @impl true
  def init(state) do
    :ets.new(@table, [:set, :named_table, :protected])
    {:ok, state}
  end

  @impl true
  def handle_call({:add_room, room_id, room}, _from, state) do
    :ets.insert_new(@table, {room_id, room})
    {:reply, :ok, state}
  end

  def add_room(room_id, room), do: GenServer.call(__MODULE__, {:add_room, room_id, room})

  @impl true
  def handle_call({:add_user, room_id, user_id}, _from, state) do
    {:ok, room} = get_room(room_id)

    updated_room = %{
      room
      | users: Map.put(room.users, user_id, %{ice_candidates: [], offer: nil})
    }

    true = :ets.update_element(@table, room_id, {2, updated_room})
    {:reply, :ok, state}
  end

  def add_user(room_id, user_id), do: GenServer.call(__MODULE__, {:add_user, room_id, user_id})

  @impl true
  def handle_call({:remove_user, room_id, user_id}, _from, state) do
    {:ok, room} = get_room(room_id)
    updated_room = %{room | users: Map.drop(room.users, [user_id])}

    true = :ets.update_element(@table, room_id, {2, updated_room})
    {:reply, :ok, state}
  end

  def remove_user(room_id, user_id),
    do: GenServer.call(__MODULE__, {:remove_user, room_id, user_id})

  @impl true
  def handle_call({:set_user_ice_candidates, room_id, user_id, ice_candidates}, _from, state) do
    {:ok, room} = get_room(room_id)
    %{users: %{^user_id => user_state}} = room

    updated_room = %{room | users: %{user_id => %{user_state | ice_candidates: ice_candidates}}}
    true = :ets.update_element(@table, room_id, {2, updated_room})
    {:reply, :ok, state}
  end

  def set_user_ice_candidates(room_id, user_id, ice_candidates),
    do: GenServer.call(__MODULE__, {:set_user_ice_candidates, room_id, user_id, ice_candidates})

  @impl true
  def handle_call({:set_user_offer, room_id, user_id, offer}, _from, state) do
    {:ok, room} = get_room(room_id)
    %{users: %{^user_id => user_state}} = room

    updated_room = %{room | users: %{user_id => %{user_state | offer: offer}}}
    true = :ets.update_element(@table, room_id, {2, updated_room})
    {:reply, :ok, state}
  end

  def set_user_offer(room_id, user_id, offer),
    do: GenServer.call(__MODULE__, {:set_user_offer, room_id, user_id, offer})

  @spec get_room(String.t()) :: {:ok, RoomState.t()} | {:error, :not_found}
  def get_room(room_id) do
    case :ets.lookup(@table, room_id) do
      [] ->
        {:error, :not_found}

      [{^room_id, room}] ->
        {:ok, room}
    end
  end
end
